import { expect } from 'chai';
import normalize from '../dist/bundle';
import isEqual from 'lodash/isEqual';

describe('data is normalized', () => {
  const json = {
    data: [
      {
        type: 'post',
        id: 3,
        attributes: {
          text: 'hello',
          number: 3,
        }
      },
      {
        type: 'post',
        id: 4,
        attributes: {
          text: 'hello world',
          number: 4,
        }
      }
    ]
  };

  const output = {
    post: {
      "3": {
        id: 3,
        attributes: {
          text: 'hello',
          number: 3
        }
      },
      "4": {
        id: 4,
        attributes: {
          text: 'hello world',
          number: 4
        }
      }
    }
  };

  it('data attributes => map: %{id => Object}', () => {
    const result = normalize(json);

    expect(isEqual(result, output)).to.be.true;
  });

  it('data is empty shouldn\'t fail', () => {
    const result = normalize({});

    expect(isEqual(result, {})).to.be.true;
  });

  it('keys camelized', () => {
    const input = {
      data: [{
        type: 'post',
        id: 1,
        attributes: {
          'key-is-camelized': 2
        }
      }]
    }

    const camelizedOutput = {
      post: {
        "1": {
          id: 1,
          attributes: {
            keyIsCamelized: 2
          }
        }
      }
    };

    expect(isEqual(normalize(input), camelizedOutput)).to.be.true;
  });
});

describe('included is normalized', () => {
  const json = {
    included: [
      {
        type: 'post',
        id: 3,
        attributes: {
          text: 'hello',
          number: 3,
        }
      },
      {
        type: 'post',
        id: 4,
        attributes: {
          text: 'hello world',
          number: 4,
        }
      }
    ]
  };

  const json2 = {
    included: [
      {
        type: 'post',
        id: 3,
        attributes: {
          text: 'hello',
          number: 3,
        }
      }
    ],
    data: [
      {
        type: 'post',
        id: 4,
        attributes: {
          text: 'hello world',
          number: 4,
        }
      }
    ]
  };

  const output = {
    post: {
      "3": {
        id: 3,
        attributes: {
          text: 'hello',
          number: 3
        }
      },
      "4": {
        id: 4,
        attributes: {
          text: 'hello world',
          number: 4
        }
      }
    }
  };

  it('included => map: %{id => Object}', () => {
    const result = normalize(json);

    expect(isEqual(result, output)).to.be.true;
  });

  it('data & included => map: %{id => Object}', () => {
    const result = normalize(json2);

    expect(isEqual(result, output)).to.be.true;
  });
});

describe('relationships', () => {
  const json = {
    data: [{
      "type": "post",
      "relationships": {
        "question": {
          "data": {
            "type": "question",
            "id": "295"
          }
        }
      },
      "id": 2620,
      "attributes": {
        "text": "hello",
      }
    }]
  };

  const output = {
    post: {
      "2620": {
        id: 2620,
        attributes: {
          text: "hello",
        },
        relationships: {
          question: {
            id: "295",
            type: "question"
          }
        }
      }
    }
  }

  it('relationships => map: %{id => Object}', () => {
    const result = normalize(json);

    expect(isEqual(result, output)).to.be.true;
  });
});

describe('meta', () => {
  const json = {
    data: [{
      "type": "post",
      "relationships": {
        "question": {
          "data": {
            "type": "question",
            "id": "295"
          }
        }
      },
      "id": 2620,
      "attributes": {
        "text": "hello",
      }
    }]
  };

  const output = {
    post: {
      "2620": {
        id: 2620,
        attributes: {
          "text": "hello",
        },
        relationships: {
          question: {
            id: "295",
            type: "question"
          }
        }
      }
    },
    meta: {
      'posts/me': {
        data: [{
          id: 2620,
          type: 'post',
          relationships: {
            question: {
              type: 'question',
              id: '295'
            }
          }
        }]
      }
    }
  }

  const json2 = {
    data: [{
      "type": "post",
      "relationships": {
        "question": {
          "data": {
            "type": "question",
            "id": "295"
          }
        }
      },
      "id": 2620,
      "attributes": {
        "text": "hello",
      }
    }],
    links: {
      next: "http://example.com/api/v1/posts/friends_feed/superyuri?page[cursor]=5037",
      first: "http://api.postie.loc/v1/posts/friends_feed/superyuri?page[cursor]=0"
    }
  };

  const output2 = {
    post: {
      "2620": {
        "id": 2620,
        attributes: {
          "text": "hello",
        },
        relationships: {
          question: {
            id: "295",
            type: "question"
          }
        }
      }
    },
    meta: {
      'posts/me': {
        data: [{
          type: 'post',
          id: 2620,
          relationships: {
            question: {
              type: 'question',
              id: '295'
            }
          }
        }],
        links: {
          next: "http://example.com/api/v1/posts/friends_feed/superyuri?page[cursor]=5037",
          first: "http://api.postie.loc/v1/posts/friends_feed/superyuri?page[cursor]=0"
        }
      }
    }
  };

  const output3 = {
    post: {
      "2620": {
        id: 2620,
        attributes: {
          "text": "hello",
        },
        relationships: {
          question: {
            id: "295",
            type: "question"
          }
        }
      }
    },
    meta: {
      'posts/me': {
        '?some=query': {
          data: [{
            type: 'post',
            id: 2620,
            relationships: {
              question: {
                type: 'question',
                id: '295'
              }
            }
          }],
          links: {
            next: "http://example.com/api/v1/posts/friends_feed/superyuri?page[cursor]=5037",
            first: "http://api.postie.loc/v1/posts/friends_feed/superyuri?page[cursor]=0"
          },
        },
        links: {
          next: "http://example.com/api/v1/posts/friends_feed/superyuri?page[cursor]=5037",
          first: "http://api.postie.loc/v1/posts/friends_feed/superyuri?page[cursor]=0"
        }
      }
    }
  };

  it('meta, no links', () => {
    const result = normalize(json, { endpoint: 'posts/me' });

    expect(isEqual(result, output)).to.be.true;
  });

  it('meta, with links', () => {
    const result = normalize(json2, { endpoint: 'posts/me' });

    expect(isEqual(result, output2)).to.be.true;
  });

  it('meta, filter works', () => {
    const result = normalize(json2, { endpoint: 'posts/me?some=query' });

    expect(isEqual(result, output2)).to.be.true;
  });

  it('meta, disable filter option works', () => {
    const result = normalize(json2, { endpoint: 'posts/me?some=query', filterEndpoint: false });

    expect(isEqual(result, output3)).to.be.true;
  });

  it('meta, meta is provided by JSON API service', () => {
    const json3 = {
      data: [{
        "type": "post",
        "relationships": {
          "question": {
            "data": {
              "type": "question",
              "id": "295"
            }
          }
        },
        id: 2620,
        "attributes": {
          "text": "hello",
        }
      }],
      meta: {
        next: "http://example.com/api/v1/posts/friends_feed/superyuri?page[cursor]=5037",
        first: "http://api.postie.loc/v1/posts/friends_feed/superyuri?page[cursor]=0"
      }
    };

    const output3 = {
      post: {
        "2620": {
          id: 2620,
          attributes: {
            "text": "hello",
          },
          relationships: {
            question: {
              id: "295",
              type: "question"
            }
          }
        }
      },
      meta: {
        'posts/me': {
          data: [{
            type: 'post',
            id: 2620,
            relationships: {
              question: {
                type: 'question',
                id: '295'
              }
            }
          }],
          meta: {
            next: "http://example.com/api/v1/posts/friends_feed/superyuri?page[cursor]=5037",
            first: "http://api.postie.loc/v1/posts/friends_feed/superyuri?page[cursor]=0"
          }
        }
      }
    };

    expect(isEqual(normalize(json3, { endpoint: 'posts/me' }), output3)).to.be.true;    
  });

  it('empty collection', () => {
    const emptyJson = {
      "data": [{
        "type": "post",
        "id": 1,
        "attributes": {
          "text": "hello"
        },
        "relationships": {
          "comments": {
            "data": []
          }
        }
      }]
    };

    const output = {
      post: {
        "1": {
          "id": 1,
          "attributes": {
            "text": "hello"
          },
          "relationships": {
            "comments": {}
          }
        }
      }
    };

    const result = normalize(emptyJson);

    expect(isEqual(result, output)).to.be.true;
  });

  it('data is null', () => {
    const emptyJson = {
      "data": [{
        "type": "post",
        "id": 1,
        "attributes": {
          "text": "hello"
        },
        "relationships": {
          "comments": {
            "data": null
          }
        }
      }]
    };

    const output = {
      post: {
        "1": {
          "id": 1,
          "attributes": {
            "text": "hello"
          },
          "relationships": {
            "comments": {}
          }
        }
      }
    };

    const result = normalize(emptyJson);

    expect(isEqual(result, output)).to.be.true;
  });

  it('meta, data is null', () => {
    const emptyJson = {
      "data": [{
        "type": "post",
        "id": 1,
        "attributes": {
          "text": "hello"
        },
        "relationships": {
          "comments": {
            "data": null
          }
        }
      }]
    };

    const output = {
      post: {
        "1": {
          "id": 1,
          "attributes": {
            "text": "hello"
          },
          "relationships": {
            "comments": {}
          }
        }
      },
      meta: {
        "posts/me": {
          data: [{
            id: 1,
            type: "post",
            relationships: {}
          }]
        }
      }
    };

    const result = normalize(emptyJson, { endpoint: 'posts/me' });

    expect(isEqual(result, output)).to.be.true;
  });
});

describe('complex', () => {
    const json = {
      data: [{
        attributes: {
          yday: 228,
          text: "Какие качества Вы больше всего цените в женщинах?",
          slug: "tbd",
        },
        id: 29,
        relationships: {
          "post-blocks": {
            data: [{
              type: "post-block",
              id: 4601
            }, {
              type: "post-block",
              id: 2454
            }]
          }
        },
        type: "question"
      }],
      included: [{
        attributes: {},
        id: 4601,
        relationships: {
          user: {
            data: {
              type: "user",
              id: 1
            }
          },
          posts: {
            data: [{
              type: "post",
              id: 4969
            }, {
              type: "post",
              id: 1606
            }
          ]}
        },
        type: "post-block"
      }, {
        attributes: {},
        id: 2454,
        relationships: {
          user: {
            data: {
              type: "user",
              id: 1
            }
          },
          posts: {
            data: [{
              type: "post",
              id: 4969
            }, {
              type: "post",
              id: 1606
            }
          ]}
        },
        type: "post-block"
      }, {
        type: "user",
        attributes: {
          slug: "superyuri",
        },
        id: 1
      }, {
        type: "post",
        id: 1606,
        attributes: {
          text: 'hello1'
        }
      }, {
        type: "post",
        id: 4969,
        attributes: {
          text: 'hello2'
        }
      }]
    };

  const output = {
    question: {
      "29": {
        id: 29,
        attributes: {
          yday: 228,
          text: "Какие качества Вы больше всего цените в женщинах?",
          slug: "tbd",
        },
        relationships: {
          "post-blocks": {
            id: "4601,2454",
            type: "post-block"
          }
        }
      }
    },
    "post-block": {
      "2454": {
        id: 2454,
        attributes: {},
        relationships: {
          user: {
            type: "user",
            id: "1"
          },
          posts: {
            type: "post",
            id: "4969,1606"
          }
        }
      },
      "4601": {
        id: 4601,
        attributes: {},
        relationships: {
          user: {
            type: "user",
            id: "1"
          },
          posts: {
            type: "post",
            id: "4969,1606"
          }
        }
      }
    },
    "user": {
      "1": {
        id: 1,
        attributes: {
          slug: "superyuri"
        }
      }
    },
    "post": {
      "1606": {
        id: 1606,
        attributes: {
          text: 'hello1'
        }
      },
      "4969": {
        id: 4969,
        attributes: {
          text: 'hello2'
        }
      }
    }
  };

  const output2 = {
    question: {
      "29": {
        id: 29,
        attributes: {
          yday: 228,
          text: "Какие качества Вы больше всего цените в женщинах?",
          slug: "tbd",
        },
        relationships: {
          "postBlocks": {
            id: "4601,2454",
            type: "postBlock"
          }
        }
      }
    },
    "postBlock": {
      "2454": {
        id: 2454,
        attributes: {},
        relationships: {
          user: {
            type: "user",
            id: "1"
          },
          posts: {
            type: "post",
            id: "4969,1606"
          }
        }
      },
      "4601": {
        id: 4601,
        attributes: {},
        relationships: {
          user: {
            type: "user",
            id: "1"
          },
          posts: {
            type: "post",
            id: "4969,1606"
          }
        }
      }
    },
    "user": {
      "1": {
        id: 1,
        attributes: {
          slug: "superyuri"
        }
      }
    },
    "post": {
      "1606": {
        id: 1606,
        attributes: {
          text: 'hello1'
        }
      },
      "4969": {
        id: 4969,
        attributes: {
          text: 'hello2'
        }
      }
    }
  };

  it('test data camelizeKeys: false', () => {
    const result = normalize(json, { camelizeKeys: false });

    expect(result).to.be.eql(output);
  });

  it('test data camelizeKeys: true', () => {
    const result = normalize(json, { camelizeKeys: true });

      expect(result).to.be.eql(output2);
  });

  const outputMeta = {
    '/post': {
      data: [{
        type: 'question',
        id: 29,
        relationships: {
          'post-blocks': {
            type: 'post-block',
            id: '4601,2454'
          }
        }
      }]
    }
  };

  const outputMeta2 = {
    '/post': {
      data: [{
        type: 'question',
        id: 29,
        relationships: {
          'postBlocks': {
            type: 'postBlock',
            id: '4601,2454'
          }
        }
      }]
    }
  };

  it('test meta, camelizeKeys: false', () => {
    const result = normalize(json, { endpoint: '/post', camelizeKeys: false });

    expect(result.meta).to.be.eql(outputMeta);
  });

  it('test meta, camelizeKeys: true', () => {
    const result = normalize(json, { endpoint: '/post', camelizeKeys: true });

    expect(result.meta).to.be.eql(outputMeta2);
  });
});

describe('lazy loading', () => {
  const json = {
    data: [{
      id: 29,
      attributes: {
        yday: 228,
        text: "Какие качества Вы больше всего цените в женщинах?",
        slug: "tbd",
      },
      relationships: {
        "movie": {
          "links": {
            "self": "http://localhost:3000/api/v1/actor/1c9d234b-66c4-411e-b785-955d57db5536/relationships/movie",
            "related": "http://localhost:3000/api/v1/actor/1c9d234b-66c4-411e-b785-955d57db5536/movie"
          }
        },        
      },
      type: "question"
    }]
  };

  const output = {
    question: {
      "29": {
        id: 29,
        attributes: {
          yday: 228,
          text: "Какие качества Вы больше всего цените в женщинах?",
          slug: "tbd",
        },
        relationships: {
          movie: {
            links: {
              "self": "http://localhost:3000/api/v1/actor/1c9d234b-66c4-411e-b785-955d57db5536/relationships/movie",
              "related": "http://localhost:3000/api/v1/actor/1c9d234b-66c4-411e-b785-955d57db5536/movie"            
            }
          }
        }
      }
    }
  };

  it('basic test', () => {
    const result = normalize(json);

    expect(isEqual(result, output)).to.be.true;    
  });
});
