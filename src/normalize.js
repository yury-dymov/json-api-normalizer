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
        const ids = [];

        let type;

        wrap(relationship).forEach((object) => {
          keys(object).forEach((key) => {
            ids.push(object[key].data.id);
            type = object[key].data.type;
          });
        });

        ret[elem.type][elem.id].relationships = {};
        ret[elem.type][elem.id].relationships[type] = join(ids, ',');
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
    const ids = {};

    wrap(json.data).forEach((object) => {
      ids[object.type] = ids[object.type] || [];
      ids[object.type].push(object.id);
    });

    keys(ids).forEach(type => ids[type] = join(ids[type], ','));

    ret.meta[endpoint].data = ids;

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
