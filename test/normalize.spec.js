import { expect } from 'chai';
import normalize from '../src/normalize';

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

    expect(result).to.eql(output);
  });

  it('data is empty shouldn\'t fail', () => {
    const result = normalize({});

    expect(result).to.eql({});
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

    expect(normalize(input)).to.eql(camelizedOutput);
  });

  it('maintains the order', () => {
    const json = {
      data: [
        {
          type: 'post',
          id: 4,
          attributes: {
            text: 'hello',
            number: 4,
          }
        },
        {
          type: 'post',
          id: 3,
          attributes: {
            text: 'hello world',
            number: 3,
          }
        },
        {
          type: 'post',
          id: 5,
          attributes: {
            text: 'hello world',
            number: 5,
          }
        }
      ]
    };

    const output = {
      post: {
        "4": {
          id: 4,
          attributes: {
            text: 'hello',
            number: 4
          }
        },
        "3": {
          id: 3,
          attributes: {
            text: 'hello world',
            number: 3
          }
        },
        "5": {
          id: 5,
          attributes: {
            text: 'hello world',
            number: 5
          }
        }
      }
    };

    expect(normalize(json)).to.eql(output);
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

    expect(result).to.eql(output);
  });

  it('data & included => map: %{id => Object}', () => {
    const result = normalize(json2);

    expect(result).to.eql(output);
  });
});

describe('relationships', () => {
  it('empty to-one', () => {
    const json = {
      data: [{
        "type": "post",
        "relationships": {
          "question": {
            "data": null,
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
              data: null,
            }
          }
        }
      }
    }

    const result = normalize(json);

    expect(result).to.eql(output);
  });

  it('empty to-many', () => {
    const json = {
      data: [{
        "type": "post",
        "relationships": {
          "tags": {
            "data": [],
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
            tags: {
              data: [],
            }
          }
        }
      }
    }

    const result = normalize(json);

    expect(result).to.eql(output);
  });

  it('non-empty to-one', () => {
    const json = {
      data: [{
        "type": "post",
        "relationships": {
          "question": {
            "data": {
              "id": 7,
              "type": "question"
            },
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
              data: {
                id: 7,
                type: "question",
              },
            }
          }
        }
      }
    }

    const result = normalize(json);

    expect(result).to.eql(output);
  });

  it('non-empty to-many', () => {
    const json = {
      data: [{
        "type": "post",
        "relationships": {
          "tags": {
            "data": [{
              "id": 4,
              "type": "tag"
            }],
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
            tags: {
              data: [{
                id: 4,
                type: "tag",
              }],
            }
          }
        }
      }
    }

    const result = normalize(json);

    expect(result).to.eql(output);
  });

  it('keys camelized', () => {
    const json = {
      data: [{
        "type": "post",
        "relationships": {
          "rel1-to-camelize": {
            "data": [{
              "id": 4,
              "type": "type1-to-camelize"
            }],
          },
          "rel2-to-camelize": {
            "data": [],
          },
          "rel3-to-camelize": {
            "data": {
              "id": 4,
              "type": "type3-to-camelize"
            },
          },
          "rel4-to-camelize": {
            "data": null,
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
            rel1ToCamelize: {
              data: [{
                id: 4,
                type: "type1ToCamelize",
              }],
            },
            rel2ToCamelize: {
              data: [],
            },
            rel3ToCamelize: {
              data: {
                id: 4,
                type: "type3ToCamelize",
              },
            },
            rel4ToCamelize: {
              data: null,
            }
          }
        }
      }
    }

    const result = normalize(json);

    expect(result).to.eql(output);
  });

  it('keep links', () => {
    const json = {
      data: [{
        "type": "post",
        "relationships": {
          "tags": {
            "data": [{
              "id": 4,
              "type": "tag"
            }],
            "links": {
              "self": "http://example.com/api/v1/post/2620/tags",
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
            tags: {
              data: [{
                id: 4,
                type: "tag",
              }],
              links: {
                self: "http://example.com/api/v1/post/2620/tags",
              }
            }
          }
        }
      }
    }

    const result = normalize(json);

    expect(result).to.eql(output);
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
            data: {
              id: "295",
              type: "question"
            }
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
              data: {
                type: 'question',
                id: '295'
              }
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
            data: {
              id: "295",
              type: "question"
            }
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
              data: {
                type: 'question',
                id: '295'
              }
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
            data: {
              id: "295",
              type: "question"
            }
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
                data: {
                  type: 'question',
                  id: '295'
                }
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

    expect(result).to.eql(output);
  });

  it('meta, with links', () => {
    const result = normalize(json2, { endpoint: 'posts/me' });

    expect(result).to.eql(output2);
  });

  it('meta, filter works', () => {
    const result = normalize(json2, { endpoint: 'posts/me?some=query' });

    expect(result).to.eql(output2);
  });

  it('meta, disable filter option works', () => {
    const result = normalize(json2, { endpoint: 'posts/me?some=query', filterEndpoint: false });

    expect(result).to.eql(output3);
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
              data: {
                id: "295",
                type: "question"
              }
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
                data: {
                  type: 'question',
                  id: '295'
                }
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

    expect(normalize(json3, { endpoint: 'posts/me' })).to.eql(output3);
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
          id: 1,
          attributes: {
            text: "hello"
          },
          relationships: {
            comments: {
              data: []
            }
          }
        }
      }
    };

    const result = normalize(emptyJson);

    expect(result).to.eql(output);
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
          ]
        }
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
          ]
        }
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
            data: [{
              id: 4601,
              type: "post-block"
            }, {
              id: 2454,
              type: "post-block"
            }]
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
            data: {
              type: "user",
              id: 1
            }
          },
          posts: {
            data: [{
              type: "post",
              id: 4969,
            }, {
              type: "post",
              id: 1606,
            }]
          }
        }
      },
      "4601": {
        id: 4601,
        attributes: {},
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
              id: 1606,
            }]
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
            data: [{
              id: 4601,
              type: "postBlock"
            }, {
              id: 2454,
              type: "postBlock"
            }]
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
            }]
          }
        }
      },
      "4601": {
        id: 4601,
        attributes: {},
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
            }]
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
            data: [{
              type: 'post-block',
              id: 4601
            }, {
              type: 'post-block',
              id: 2454
            }]
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
            data: [{
              type: 'postBlock',
              id: 4601
            }, {
              type: 'postBlock',
              id: 2454
            }]
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

    expect(result).to.eql(output);
  });
});
