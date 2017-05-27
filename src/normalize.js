import camelCase from 'lodash/camelCase';
import isArray from 'lodash/isArray';
import isNull from 'lodash/isNull';
import keys from 'lodash/keys';
import merge from 'lodash/merge';

function wrap(json) {
  if (isArray(json)) {
    return json;
  }

  return [json];
}

function extractRelationships(relationships, { camelizeKeys }) {
  const ret = new Map();
  
  keys(relationships).forEach((key) => {
    const relationship = relationships[key];
    const name = camelizeKeys ? camelCase(key) : key;
    ret[name] = {};

    if (typeof relationship.data !== 'undefined') {
      if (isArray(relationship.data)) {
        ret[name].data = relationship.data.map(e => ({
          id: e.id,
          type: camelizeKeys ? camelCase(e.type) : e.type,
        }));
      } else if (!isNull(relationship.data)) {
        ret[name].data = {
          id: relationship.data.id,
          type: camelizeKeys ? camelCase(relationship.data.type) : relationship.data.type,
        };
      } else {
        ret[name].data = relationship.data;
      }
    }

    if (relationship.links) {
      ret[name].links = relationship.links;
    }
  });
  return ret;
}

function extractEntities(json, { camelizeKeys }) {
  const ret = new Map();

  wrap(json).forEach((elem) => {
    const type = camelizeKeys ? camelCase(elem.type) : elem.type;

    ret[type] = ret[type] || {};
    ret[type][elem.id] = ret[type][elem.id] || {
      id: elem.id,
    };

    if (camelizeKeys) {
      ret[type][elem.id].attributes = {};

      keys(elem.attributes).forEach((key) => {
        ret[type][elem.id].attributes[camelCase(key)] = elem.attributes[key];
      });
    } else {
      ret[type][elem.id].attributes = elem.attributes;
    }

    if (elem.relationships) {
      ret[type][elem.id].relationships =
        extractRelationships(elem.relationships, { camelizeKeys });
    }
  });

  return ret;
}

function doFilterEndpoint(endpoint) {
  return endpoint.replace(/\?.*$/, '');
}

function extractMetaData(json, endpoint, { camelizeKeys, filterEndpoint }) {
  const ret = new Map();

  ret.meta = {};

  let metaObject;

  if (!filterEndpoint) {
    const filteredEndpoint = doFilterEndpoint(endpoint);

    ret.meta[filteredEndpoint] = {};
    ret.meta[filteredEndpoint][endpoint.slice(filteredEndpoint.length)] = {};
    metaObject = ret.meta[filteredEndpoint][endpoint.slice(filteredEndpoint.length)];
  } else {
    ret.meta[endpoint] = {};
    metaObject = ret.meta[endpoint];
  }

  metaObject.data = {};

  if (json.data) {
    const meta = [];

    wrap(json.data).forEach((object) => {
      const pObject = { id: object.id, type: camelizeKeys ? camelCase(object.type) : object.type };

      if (object.relationships) {
        pObject.relationships =
          extractRelationships(object.relationships, { camelizeKeys });
      }

      meta.push(pObject);
    });

    metaObject.data = meta;

    if (json.links) {
      metaObject.links = json.links;
      ret.meta[doFilterEndpoint(endpoint)].links = json.links;
    }

    if (json.meta) {
      metaObject.meta = json.meta;
    }
  }

  return ret;
}

export default function normalize(json, opts = {}) {
  const ret = new Map();
  const { endpoint } = opts;
  let { filterEndpoint, camelizeKeys } = opts;

  if (typeof filterEndpoint === 'undefined') {
    filterEndpoint = true;
  }

  if (typeof camelizeKeys === 'undefined') {
    camelizeKeys = true;
  }

  if (json.data) {
    merge(ret, extractEntities(json.data, { camelizeKeys }));
  }

  if (json.included) {
    merge(ret, extractEntities(json.included, { camelizeKeys }));
  }

  if (endpoint) {
    const endpointKey = filterEndpoint ? doFilterEndpoint(endpoint) : endpoint;

    merge(ret, extractMetaData(json, endpointKey, { camelizeKeys, filterEndpoint }));
  }

  return ret;
}
