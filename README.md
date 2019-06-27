# json-api-normalizer

Utility to normalize JSON API data for redux applications

[![npm version](https://img.shields.io/npm/v/json-api-normalizer.svg?style=flat)](https://www.npmjs.com/package/json-api-normalizer)
[![Downloads](http://img.shields.io/npm/dm/json-api-normalizer.svg?style=flat-square)](https://npmjs.org/package/json-api-normalizer)
[![Build Status](https://img.shields.io/travis/yury-dymov/json-api-normalizer/master.svg?style=flat)](https://travis-ci.org/yury-dymov/json-api-normalizer)
[![Coverage Status](https://coveralls.io/repos/github/yury-dymov/json-api-normalizer/badge.svg?branch=master)](https://coveralls.io/github/yury-dymov/json-api-normalizer?branch=master)

# Description

json-api-normalizer helps awesome [JSON API](http://jsonapi.org/) and [redux](http://redux.js.org/) work together.
Unlike [normalizr](https://github.com/paularmstrong/normalizr) json-api-normalizer supports JSON API specification, which means that you don't have to care about schemes. It also converts collections into maps, which is a lot more suitable for redux.

Demo - [https://yury-dymov.github.io/json-api-react-redux-example/](https://yury-dymov.github.io/json-api-react-redux-example/)

Demo sources - [https://github.com/yury-dymov/json-api-react-redux-example](https://github.com/yury-dymov/json-api-react-redux-example)

Works great together with [redux-object](https://github.com/yury-dymov/redux-object), which helps to fetch and denormalize data from the store.

json-api-normalizer was recently featured in SmashingMagazine: https://www.smashingmagazine.com/2017/05/json-api-normalizer-redux/

# Install

```shell
$ npm install json-api-normalizer
```

# Example

```JavaScript
import normalize from 'json-api-normalizer';

const json = {
  data: [{
    "type": "post-block",
    "relationships": {
      "question": {
        "data": {
          "type": "question",
          "id": "295"
        }
      }
    },
    "id": "2620",
    "attributes": {
      "text": "I am great!",
      "id": 2620
    }
  }],
  included: [{
    "type": "question",
    "id": "295",
    "attributes": {
      "text": "How are you?",
      id: 295
    }
  }]
};

console.log(normalize(json));
/* Output:
{
  question: {
    "295": {
      id: 295,
      type: "question"
      attributes: {
        text: "How are you?"
      }
    }
  },
  postBlock: {
    "2620": {
      id: 2620,
      type: "postBlock",
      attributes: {
        text: "I am great!"
      },
      relationships: {
        question: {
          type: "question",
          id: "295"
        }
      }
    }
  }
}
*/
```

# Options

## Endpoint And Metadata

While using redux, it is supposed that cache is incrementally updated during the application lifecycle. However, you might face an issue if two different requests are working with the same data objects, and after normalization, it is not clear how to distinguish, which data objects are related to which request. json-api-normalizer can handle such situations by saving the API response structure as metadata, so you can easily get only data corresponding to the certain request.

```JavaScript
console.log(normalize(json, { endpoint: '/post-block/2620' }));
/* Output:
{
  question: {
    ...
  },
  postBlock: {
    ...
  },
  meta: {
    "/post-block/2620": {
      data: [{
        type: "postBlock",
        id: 2620,
        relationships: {
          "question": {
            type: "question",
            id: "295"
          }
      }]
    }
  }
}
*/
```

## Endpoint And Query Options

By default request query options are ignored as it is supposed that data is incrementally updated. You can override this behavior by setting `filterEndpoint` option value to `false`.

```JavaScript
const d1 = normalize(json, { endpoint: '/post-block/2620?page[cursor]=0' });
const d2 = normalize(json, { endpoint: '/post-block/2620?page[cursor]=20' });
console.log(Object.assign({}, d1, d2));
/* Output:
{
  question: {
    ...
  },
  postBlock: {
    ...
  },
  meta: {
    "/post-block/2620": {
      ...
    }
  }
}
*/

const d1 = normalize(json, { endpoint: '/post-block/2620?page[cursor]=0', filterEndpoint: false });
const d2 = normalize(json, { endpoint: '/post-block/2620?page[cursor]=20', filterEndpoint: false });
console.log(someFunctionWhichMergesStuff({}, d1, d2));
/* Output:
{
  question: {
    ...
  },
  postBlock: {
    ...
  },
  meta: {
    "/post-block/2620: {
      "?page[cursor]=0": {
        ...
      },
      "?page[cursor]=20": {
        ...
      }
    }
  }
}
*/
```

## Pagination And Links

If JSON API returns links section and you define the endpoint, then links are also stored in metadata.

```JavaScript
const json = {
  data: [{
    ...
  }],
  included: [{
    ...
  }],
  links: {
    first: "http://example.com/api/v1/post-block/2620?page[cursor]=0",
    next: "http://example.com/api/v1/post-block/2620?page[cursor]=20"
  }
};

console.log(normalize(json, { endpoint: '/post-block/2620?page[cursor]=0'}));
/* Output:
{
  question: {
    ...
  },
  postBlock: {
    ...
  },
  meta: {
    "/post-block/2620": {
      data: [{
        ...
      }],
      links: {
        first: "http://example.com/api/v1/post-block/2620?page[cursor]=0",
        next: "http://example.com/api/v1/post-block/2620?page[cursor]=20"
      }
    }
  }
}
*/
```

## Lazy Loading

If you want to lazy load nested objects, json-api-normalizer will store links for that

```JavaScript
const json = {
  data: [{
    attributes: {
      ...
    },
    id: "29",
    relationships: {
      "movie": {
        "links": {
          "self": "http://...",
          "related": "http://..."
        }
      },
    },
    type: "question"
  }]
};

console.log(normalize(json));
/* Output:
{
  question: {
    "29": {
      attributes: {
        ...
      },
      relationships: {
        movie: {
          links: {
            "self": "http://...",
            "related": "http://..."
          }
        }
      }
    }
  }
}
*/
```

## Camelize Keys

By default all object keys and type names are camelized, however, you can disable this with `camelizeKeys` option.

```JavaScript
const json = {
  data: [{
    type: "post-block",
    id: "1",
    attributes: {
      "camel-me": 1,
      id: 1
    }
  }]
}

console.log(normalize(json));
/* Output:
{
  postBlock: {
    "1": {
      id: 1,
      type: "postBlock",
      attributes: {
        camelMe: 1
      }
    }
  }
}
*/

console.log(normalize(json, { camelizeKeys: false }));
/* Output:
{
  "post-block": {
    "1": {
      id: 1,
      type: "postBlock",
      attributes: {
        "camel-me": 1
      }
    }
  }
}
*/
```

## Camelize Type Values

By default propagated type values are camelized but original value may be also preserved

```JavaScript
const json = {
  data: [{
    type: "post-block",
    id: "1",
    attributes: {
      "camel-me": 1,
      id: 1
    }
  }]
}

console.log(normalize(json, { camelizeTypeValues: false }));
/* Output:
{
  postBlock: {
    "1": {
      id: 1,
      type: "post-block", // <-- this
      attributes: {
        camelMe: 1
      }
    }
  }
}
*/
```

# Copyright

MIT (c) Yury Dymov
