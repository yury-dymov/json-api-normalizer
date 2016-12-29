import isArray from 'lodash/isArray';
import join from 'lodash/join';
import keys from 'lodash/keys';
import merge from 'lodash/merge';

function wrap(json) {
  if (isArray(json)) {
    return json;
  }

  return [json];
}

function extract(json) {
  const ret = {};

  wrap(json).forEach((elem) => {
    ret[elem.type] = ret[elem.type] || {};
    ret[elem.type][elem.id] = ret[elem.type][elem.id] || {};
    ret[elem.type][elem.id].attributes = elem.attributes;

    if (elem.relationships) {
      wrap(elem.relationships).forEach((relationship) => {
        const mp = {};

        wrap(relationship).forEach((object) => {
          keys(object).forEach((key) => {
            const ids = wrap(object[key].data).map(elem => elem.id);

            mp[key] = {
              id: ids.length == 1 ? ids[0].toString() : join(ids, ','),
              type: wrap(object[key].data)[0].type
            };
          });
        });

        ret[elem.type][elem.id].relationships = mp;
      });
    }
  });

  return ret;
}

function doFilterEndpoint(endpoint) {
  return endpoint.replace(/\?.*$/, '');
}

function extractMetaData(json, endpoint) {
  const ret = {};

  ret.meta = {};
  ret.meta[endpoint] = {};
  ret.meta[endpoint].data = {};

  if (json.data) {
    const meta = [];

    wrap(json.data).forEach((object) => {
      const ret = { id: object.id, type: object.type };

      if (object.relationships) {
        keys(object.relationships).forEach((key) => {
          ret.relationships = ret.relationships || {};

          if (wrap(object.relationships[key].data).length > 0) {
            const ids = wrap(object.relationships[key].data).map(elem => elem.id);

            ret.relationships[key] = { type: wrap(object.relationships[key].data)[0].type, id: join(ids, ',') };
          }
        });
      }

      meta.push(ret);
    });

    ret.meta[endpoint].data = meta;

    if (json.links) {
      ret.meta[endpoint].links = json.links;
    }
  }

  return ret;
}

export default function normalize(json, endpoint = null, opts = {}) {
  const ret = {};
  let { filterEndpoint } = opts;

  if (typeof filterEndpoint === 'undefined') {
    filterEndpoint = true;
  }

  if (json.data) {
    merge(ret, extract(json.data));
  }

  if (json.included) {
    merge(ret, extract(json.included));
  }

  if (endpoint) {
    merge(ret, extractMetaData(json, filterEndpoint ? doFilterEndpoint(endpoint) : endpoint));
  }

  return ret;
}
