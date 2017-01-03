import chai, { expect } from 'chai';
import normalize from '../dist/bundle';
import isEqual from 'lodash/isEqual';
import merge from 'lodash/merge';

describe('data is normalized', () => {
  const json = {
    data: [
      {
        type: 'post',
        id: "3",
        attributes: {
          text: 'hello',
          number: 3,
          id: 3
        }
      },
      {
        type: 'post',
        id: "4",
        attributes: {
          text: 'hello world',
          number: 4,
          id: 4
        }
      }
    ]
  };

  const output = {
    post: {
      "3": {
        attributes: {
          id: 3,
          text: 'hello',
          number: 3
        }
      },
      "4": {
        attributes: {
          id: 4,
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
        id: "1",
        attributes: {
          id: 1,
          'key-is-camelized': 2
        }
      }]
    }

    const camelizedOutput = {
      post: {
        "1": {
          attributes: {
            id: 1,
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
        id: "3",
        attributes: {
          text: 'hello',
          number: 3,
          id: 3
        }
      },
      {
        type: 'post',
        id: "4",
        attributes: {
          text: 'hello world',
          number: 4,
          id: 4
        }
      }
    ]
  };

  const json2 = {
    included: [
      {
        type: 'post',
        id: "3",
        attributes: {
          text: 'hello',
          number: 3,
          id: 3
        }
      }
    ],
    data: [
      {
        type: 'post',
        id: "4",
        attributes: {
          text: 'hello world',
          number: 4,
          id: 4
        }
      }
    ]
  };

  const output = {
    post: {
      "3": {
        attributes: {
          id: 3,
          text: 'hello',
          number: 3
        }
      },
      "4": {
        attributes: {
          id: 4,
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
      "id": "2620",
      "attributes": {
        "text": "hello",
        "id": 2620
      }
    }]
  };

  const output = {
    post: {
      "2620": {
        attributes: {
          "text": "hello",
          "id": 2620
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
      "id": "2620",
      "attributes": {
        "text": "hello",
        "id": 2620
      }
    }]
  };

  const output = {
    post: {
      "2620": {
        attributes: {
          "text": "hello",
          "id": 2620
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
          id: '2620',
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
      "id": "2620",
      "attributes": {
        "text": "hello",
        "id": 2620
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
        attributes: {
          "text": "hello",
          "id": 2620
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
          id: '2620',
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
  }

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

    expect(isEqual(result, output2)).to.be.false;
  });

  it('empty collection', () => {
    const emptyJson = {
      "data": [{
        "type": "post",
        "id": "1",
        "attributes": {
          "id": 1,
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
          "attributes": {
            "id": 1,
            "text": "hello"
          },
          "relationships": {}
        }
      }
    }

    const result = normalize(emptyJson);

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
          id: 29
        },
        id: "29",
        relationships: {
          "post-blocks": {
            data: [{
              type: "post-block",
              id: "4601"
            }, {
              type: "post-block",
              id: "2454"
            }]
          }
        },
        type: "question"
      }],
      included: [{
        attributes: {id: 4601},
        id: "4601",
        relationships: {
          user: {
            data: {
              type: "user",
              id: "1"
            }
          },
          posts: {
            data: [{
              type: "post",
              id: "4969"
            }, {
              type: "post",
              id: "1606"
            }
          ]}
        },
        type: "post-block"
      }, {
        attributes: {id: 2454},
        id: "2454",
        relationships: {
          user: {
            data: {
              type: "user",
              id: "1"
            }
          },
          posts: {
            data: [{
              type: "post",
              id: "4969"
            }, {
              type: "post",
              id: "1606"
            }
          ]}
        },
        type: "post-block"
      }, {
        type: "user",
        attributes: {
          slug: "superyuri",
          id: 1
        },
        id: "1"
      }, {
        type: "post",
        id: "1606",
        attributes: {
          id: 1606,
          text: 'hello1'
        }
      }, {
        type: "post",
        id: "4969",
        attributes: {
          id: 4969,
          text: 'hello2'
        }
      }]
    };

  const output = {
    question: {
      "29": {
        attributes: {
          yday: 228,
          text: "Какие качества Вы больше всего цените в женщинах?",
          slug: "tbd",
          id: 29
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
        attributes: {
          id: 2454
        },
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
        attributes: {
          id: 4601
        },
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
        attributes: {
          id: 1,
          slug: "superyuri"
        }
      }
    },
    "post": {
      "1606": {
        attributes: {
          id: 1606,
          text: 'hello1'
        }
      },
      "4969": {
        attributes: {
          id: 4969,
          text: 'hello2'
        }
      }
    }
  };

  const output2 = {
    question: {
      "29": {
        attributes: {
          yday: 228,
          text: "Какие качества Вы больше всего цените в женщинах?",
          slug: "tbd",
          id: 29
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
        attributes: {
          id: 2454
        },
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
        attributes: {
          id: 4601
        },
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
        attributes: {
          id: 1,
          slug: "superyuri"
        }
      }
    },
    "post": {
      "1606": {
        attributes: {
          id: 1606,
          text: 'hello1'
        }
      },
      "4969": {
        attributes: {
          id: 4969,
          text: 'hello2'
        }
      }
    }
  };

  it('test data camelizeKeys: false', () => {
    const result = normalize(json, { camelizeKeys: false });

    expect(isEqual(result, output)).to.be.true;
  });

  it('test data camelizeKeys: true', () => {
    const result = normalize(json, { camelizeKeys: true });

    expect(isEqual(result, output2)).to.be.true;
  });

  const outputMeta = {
    '/post': {
      data: [{
        type: 'question',
        id: '29',
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
        id: '29',
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

    expect(isEqual(result.meta, outputMeta)).to.be.true;
  });

  it('test meta, camelizeKeys: true', () => {
    const result = normalize(json, { endpoint: '/post', camelizeKeys: true });

    expect(isEqual(result.meta, outputMeta2)).to.be.true;
  });
});
