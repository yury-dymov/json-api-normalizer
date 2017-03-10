import camelCase from 'lodash/camelCase';
import isArray from 'lodash/isArray';
import isNull from 'lodash/isNull';
import join from 'lodash/join';
import keys from 'lodash/keys';
import merge from 'lodash/merge';

function wrap(json) {
  if (isArray(json)) {
    return json;
  }

  return [json];
}

function extract(json, { camelizeKeys }) {
  const ret = {};

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
      wrap(elem.relationships).forEach((relationship) => {
        const mp = {};

        wrap(relationship).forEach((object) => {
          keys(object).forEach((key) => {
            mp[camelizeKeys ? camelCase(key) : key] = {};

            if (typeof object[key].data !== 'undefined' && !isNull(object[key].data)) {
              if (wrap(object[key].data).length > 0) {
                const ids = wrap(object[key].data).map(el => el.id);
                const relType = wrap(object[key].data)[0].type;

                mp[camelizeKeys ? camelCase(key) : key] = {
                  id: ids.length === 1 ? ids[0].toString() : join(ids, ','),
                  type: camelizeKeys ? camelCase(relType) : relType,
                };
              }
            }

            if (object[key].links) {
              mp[camelizeKeys ? camelCase(key) : key].links = object[key].links;
            }
          });
        });

        ret[type][elem.id].relationships = mp;
      });
    }
  });

  return ret;
}

function doFilterEndpoint(endpoint) {
  return endpoint.replace(/\?.*$/, '');
}

function extractMetaData(json, endpoint, { camelizeKeys, filterEndpoint }) {
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
      const pObject = { id: object.id, type: camelizeKeys ? camelCase(object.type) : object.type };

      if (object.relationships) {
        keys(object.relationships).forEach((key) => {
          pObject.relationships = pObject.relationships || {};

          if (typeof object.relationships[key].data !== 'undefined' && !isNull(object.relationships[key].data)) {
            if (wrap(object.relationships[key].data).length > 0) {
              const ids = wrap(object.relationships[key].data).map(elem => elem.id);
              const type = wrap(object.relationships[key].data)[0].type;

              pObject.relationships[camelizeKeys ? camelCase(key) : key] = {
                type: camelizeKeys ? camelCase(type) : type,
                id: join(ids, ','),
              };
            }
          }
        });
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
  const ret = {};
  const { endpoint } = opts;
  let { filterEndpoint, camelizeKeys } = opts;

  if (typeof filterEndpoint === 'undefined') {
    filterEndpoint = true;
  }

  if (typeof camelizeKeys === 'undefined') {
    camelizeKeys = true;
  }

  if (json.data) {
    merge(ret, extract(json.data, { camelizeKeys }));
  }

  if (json.included) {
    merge(ret, extract(json.included, { camelizeKeys }));
  }

  if (endpoint) {
    const endpointKey = filterEndpoint ? doFilterEndpoint(endpoint) : endpoint;

    merge(ret, extractMetaData(json, endpointKey, { camelizeKeys, filterEndpoint }));
  }

  return ret;
}
