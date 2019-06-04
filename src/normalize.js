import merge from 'lodash.merge';

const wrap = json => (Array.isArray(json) ? json : [json]);
const camelCase = value => value.replace(/[_-](\w)/g, (_, w) => w.toUpperCase());
const isDate = attributeValue => Object.prototype.toString.call(attributeValue) === '[object Date]';

function camelizeNestedKeys(attributeValue) {
  if (attributeValue === null || typeof attributeValue !== 'object' || isDate(attributeValue)) {
    return attributeValue;
  }

  if (Array.isArray(attributeValue)) {
    return attributeValue.map(camelizeNestedKeys);
  }

  const copy = {};

  Object.keys(attributeValue).forEach((k) => {
    copy[camelCase(k)] = camelizeNestedKeys(attributeValue[k]);
  });

  return copy;
}

function extractRelationships(relationships, { camelizeKeys, camelizeTypeValues }) {
  const ret = {};
  Object.keys(relationships).forEach((key) => {
    const relationship = relationships[key];
    const name = camelizeKeys ? camelCase(key) : key;
    ret[name] = {};

    if (typeof relationship.data !== 'undefined') {
      if (Array.isArray(relationship.data)) {
        ret[name].data = relationship.data.map(e => ({
          id: e.id,
          type: camelizeTypeValues ? camelCase(e.type) : e.type,
        }));
      } else if (relationship.data !== null) {
        ret[name].data = {
          id: relationship.data.id,
          type: camelizeTypeValues ? camelCase(relationship.data.type) : relationship.data.type,
        };
      } else {
        ret[name].data = relationship.data;
      }

      if (typeof relationship.meta !== 'undefined') {
        ret[name].meta = camelizeNestedKeys(relationship.meta);
      }
    }

    if (relationship.links) {
      ret[name].links = camelizeKeys ? camelizeNestedKeys(relationship.links) : relationship.links;
    }
  });
  return ret;
}

function processMeta(metaObject, { camelizeKeys }) {
  if (camelizeKeys) {
    const meta = {};

    Object.keys(metaObject).forEach((key) => {
      meta[camelCase(key)] = camelizeNestedKeys(metaObject[key]);
    });

    return meta;
  }

  return metaObject;
}

function extractEntities(json, { camelizeKeys, camelizeTypeValues }) {
  const ret = {};

  wrap(json).forEach((elem) => {
    const type = camelizeKeys ? camelCase(elem.type) : elem.type;

    ret[type] = ret[type] || {};
    ret[type][elem.id] = ret[type][elem.id] || {
      id: elem.id,
    };
    ret[type][elem.id].type = camelizeTypeValues ? camelCase(elem.type) : elem.type;

    if (camelizeKeys) {
      ret[type][elem.id].attributes = {};

      Object.keys(elem.attributes).forEach((key) => {
        ret[type][elem.id].attributes[camelCase(key)] = camelizeNestedKeys(elem.attributes[key]);
      });
    } else {
      ret[type][elem.id].attributes = elem.attributes;
    }

    if (elem.links) {
      ret[type][elem.id].links = {};

      Object.keys(elem.links).forEach((key) => {
        const newKey = camelizeKeys ? camelCase(key) : key;
        ret[type][elem.id].links[newKey] = elem.links[key];
      });
    }

    if (elem.relationships) {
      ret[type][elem.id].relationships = extractRelationships(elem.relationships, {
        camelizeKeys,
        camelizeTypeValues,
      });
    }

    if (elem.meta) {
      ret[type][elem.id].meta = processMeta(elem.meta, { camelizeKeys });
    }
  });

  return ret;
}

function doFilterEndpoint(endpoint) {
  return endpoint.replace(/\?.*$/, '');
}

function extractMetaData(json, endpoint, { camelizeKeys, camelizeTypeValues, filterEndpoint }) {
  const ret = {};

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
      const pObject = {
        id: object.id,
        type: camelizeTypeValues ? camelCase(object.type) : object.type,
      };

      if (object.relationships) {
        pObject.relationships = extractRelationships(object.relationships, {
          camelizeKeys,
          camelizeTypeValues,
        });
      }

      meta.push(pObject);
    });

    metaObject.data = meta;
  }

  if (json.links) {
    metaObject.links = json.links;
    ret.meta[doFilterEndpoint(endpoint)].links = json.links;
  }

  if (json.meta) {
    metaObject.meta = processMeta(json.meta, { camelizeKeys });
  }

  return ret;
}

export default function normalize(json, opts = {}) {
  const ret = {};
  const { endpoint } = opts;
  let { filterEndpoint, camelizeKeys, camelizeTypeValues } = opts;

  if (typeof filterEndpoint === 'undefined') {
    filterEndpoint = true;
  }

  if (typeof camelizeKeys === 'undefined') {
    camelizeKeys = true;
  }

  if (typeof camelizeTypeValues === 'undefined') {
    camelizeTypeValues = true;
  }

  if (json.data) {
    merge(ret, extractEntities(json.data, { camelizeKeys, camelizeTypeValues }));
  }

  if (json.included) {
    merge(ret, extractEntities(json.included, { camelizeKeys, camelizeTypeValues }));
  }

  if (endpoint) {
    const endpointKey = filterEndpoint ? doFilterEndpoint(endpoint) : endpoint;

    merge(ret, extractMetaData(json, endpointKey, {
      camelizeKeys,
      camelizeTypeValues,
      filterEndpoint,
    }));
  }

  return ret;
}
