import { expect } from 'chai';
import normalize from '../dist/bundle';

describe('data is normalized', () => {
  const json = {
    data: [
      {
        type: 'post',
        id: 3,
        attributes: {
          text: 'hello',
          number: 3,
        },
        links: {
          self: 'http://www.example.com/post/3',
        },
        meta: {
          likes: 35,
        },
      },
      {
        type: 'post',
        id: 4,
        attributes: {
          text: 'hello world',
          number: 4,
        },
        links: {
          self: 'http://www.example.com/post/4',
        },
      },
    ],
  };

  const output = {
    post: {
      3: {
        type: 'post',
        id: 3,
        attributes: {
          text: 'hello',
          number: 3,
        },
        links: {
          self: 'http://www.example.com/post/3',
        },
        meta: {
          likes: 35,
        },
      },
      4: {
        type: 'post',
        id: 4,
        attributes: {
          text: 'hello world',
          number: 4,
        },
        links: {
          self: 'http://www.example.com/post/4',
        },
      },
    },
  };

  it('data attributes => map: %{id => Object}', () => {
    const result = normalize(json);

    expect(result).to.deep.equal(output);
  });

  it("data is empty shouldn't fail", () => {
    const result = normalize({});

    expect(result).to.deep.equal({});
  });

  it('keys camelized', () => {
    const input = {
      data: [
        {
          type: 'post',
          id: 1,
          attributes: {
            'key-is-camelized': 2,
          },
          meta: {
            'this-key-too': 3,
          },
          links: {
            this_link: 'http://link.com'
          }
        },
      ],
    };

    const camelizedOutput = {
      post: {
        1: {
          type: 'post',
          id: 1,
          attributes: {
            keyIsCamelized: 2,
          },
          meta: {
            thisKeyToo: 3,
          },
          links: {
            thisLink: 'http://link.com'
          }
        },
      },
    };

    const result = normalize(input);

    expect(result).to.deep.equal(camelizedOutput);
  });

  it('nested keys camelized', () => {
    const input = {
      data: [
        {
          type: 'post',
          id: 1,
          attributes: {
            key_is_camelized: 2,
            another_key: {
              and_yet_another: 3,
            },
          },
        },
      ],
    };

    const camelizedOutput = {
      post: {
        1: {
          type: 'post',
          id: 1,
          attributes: {
            keyIsCamelized: 2,
            anotherKey: {
              andYetAnother: 3,
            },
          },
        },
      },
    };

    const result = normalize(input);

    expect(result).to.deep.equal(camelizedOutput);
  });

  it('arrays are still array after camelization', () => {
    const input = {
      data: [
        {
          type: 'post',
          id: 1,
          attributes: {
            key_is_camelized: ['a', 'b'],
          },
        },
      ],
    };

    const camelizedOutput = {
      post: {
        1: {
          type: 'post',
          id: 1,
          attributes: {
            keyIsCamelized: ['a', 'b'],
          },
        },
      },
    };

    const result = normalize(input);

    expect(result).to.deep.equal(camelizedOutput);
  });

  it('dates should not be affected by camilization', () => {
    const date = new Date();

    const obj = {
      data: {
        id: 1,
        type: 'projects',
        attributes: {
          'started-at': date,
        },
      },
    };

    const output = {
      projects: {
        1: {
          type: 'projects',
          id: 1,
          attributes: {
            startedAt: date,
          },
        },
      },
    };

    const result = normalize(obj);

    expect(result).to.deep.equal(output);
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
        },
      },
      {
        type: 'post',
        id: 4,
        attributes: {
          text: 'hello world',
          number: 4,
        },
      },
    ],
  };

  const json2 = {
    included: [
      {
        type: 'post',
        id: 3,
        attributes: {
          text: 'hello',
          number: 3,
        },
      },
    ],
    data: [
      {
        type: 'post',
        id: 4,
        attributes: {
          text: 'hello world',
          number: 4,
        },
      },
    ],
  };

  const output = {
    post: {
      3: {
        type: 'post',
        id: 3,
        attributes: {
          text: 'hello',
          number: 3,
        },
      },
      4: {
        type: 'post',
        id: 4,
        attributes: {
          text: 'hello world',
          number: 4,
        },
      },
    },
  };

  it('included => map: %{id => Object}', () => {
    const result = normalize(json);

    expect(result).to.deep.equal(output);
  });

  it('data & included => map: %{id => Object}', () => {
    const result = normalize(json2);

    expect(result).to.deep.equal(output);
  });
});

describe('relationships', () => {
  it('empty to-one', () => {
    const json = {
      data: [
        {
          type: 'post',
          relationships: {
            question: {
              data: null,
            },
          },
          id: 2620,
          attributes: {
            text: 'hello',
          },
        },
      ],
    };

    const output = {
      post: {
        2620: {
          type: 'post',
          id: 2620,
          attributes: {
            text: 'hello',
          },
          relationships: {
            question: {
              data: null,
            },
          },
        },
      },
    };

    const result = normalize(json);

    expect(result).to.deep.equal(output);
  });

  it('empty to-many', () => {
    const json = {
      data: [
        {
          type: 'post',
          relationships: {
            tags: {
              data: [],
            },
          },
          id: 2620,
          attributes: {
            text: 'hello',
          },
        },
      ],
    };

    const output = {
      post: {
        2620: {
          type: 'post',
          id: 2620,
          attributes: {
            text: 'hello',
          },
          relationships: {
            tags: {
              data: [],
            },
          },
        },
      },
    };

    const result = normalize(json);

    expect(result).to.deep.equal(output);
  });

  it('non-empty to-one', () => {
    const json = {
      data: [
        {
          type: 'post',
          relationships: {
            question: {
              data: {
                id: 7,
                type: 'question',
              },
            },
          },
          id: 2620,
          attributes: {
            text: 'hello',
          },
        },
      ],
    };

    const output = {
      post: {
        2620: {
          type: 'post',
          id: 2620,
          attributes: {
            text: 'hello',
          },
          relationships: {
            question: {
              data: {
                id: 7,
                type: 'question',
              },
            },
          },
        },
      },
    };

    const result = normalize(json);

    expect(result).to.deep.equal(output);
  });

  it('non-empty to-many', () => {
    const json = {
      data: [
        {
          type: 'post',
          relationships: {
            tags: {
              data: [
                {
                  id: 4,
                  type: 'tag',
                },
              ],
            },
          },
          id: 2620,
          attributes: {
            text: 'hello',
          },
        },
      ],
    };

    const output = {
      post: {
        2620: {
          type: 'post',
          id: 2620,
          attributes: {
            text: 'hello',
          },
          relationships: {
            tags: {
              data: [
                {
                  id: 4,
                  type: 'tag',
                },
              ],
            },
          },
        },
      },
    };

    const result = normalize(json);

    expect(result).to.deep.equal(output);
  });

  it('keys camelized', () => {
    const json = {
      data: [
        {
          type: 'post',
          relationships: {
            'rel1-to-camelize': {
              data: [
                {
                  id: 4,
                  type: 'type1-to-camelize',
                },
              ],
            },
            'rel2-to-camelize': {
              data: [],
            },
            'rel3-to-camelize': {
              data: {
                id: 4,
                type: 'type3-to-camelize',
              },
            },
            'rel4-to-camelize': {
              data: null,
            },
          },
          id: 2620,
          attributes: {
            text: 'hello',
          },
        },
      ],
    };

    const output = {
      post: {
        2620: {
          type: 'post',
          id: 2620,
          attributes: {
            text: 'hello',
          },
          relationships: {
            rel1ToCamelize: {
              data: [
                {
                  id: 4,
                  type: 'type1ToCamelize',
                },
              ],
            },
            rel2ToCamelize: {
              data: [],
            },
            rel3ToCamelize: {
              data: {
                id: 4,
                type: 'type3ToCamelize',
              },
            },
            rel4ToCamelize: {
              data: null,
            },
          },
        },
      },
    };

    const result = normalize(json);

    expect(result).to.deep.equal(output);
  });

  it('keep links', () => {
    const json = {
      data: [
        {
          type: 'post',
          relationships: {
            tags: {
              data: [
                {
                  id: 4,
                  type: 'tag',
                },
              ],
              links: {
                self: 'http://example.com/api/v1/post/2620/tags',
              },
            },
          },
          id: 2620,
          attributes: {
            text: 'hello',
          },
        },
      ],
    };

    const output = {
      post: {
        2620: {
          type: 'post',
          id: 2620,
          attributes: {
            text: 'hello',
          },
          relationships: {
            tags: {
              data: [
                {
                  id: 4,
                  type: 'tag',
                },
              ],
              links: {
                self: 'http://example.com/api/v1/post/2620/tags',
              },
            },
          },
        },
      },
    };

    const result = normalize(json);

    expect(result).to.deep.equal(output);
  });

  it('camelize links', () => {
    const json = {
      data: [
        {
          type: 'post',
          relationships: {
            tags: {
              data: [
                {
                  id: 4,
                  type: 'tag',
                },
              ],
              links: {
                camel_case: 'http://example.com/api/v1/post/2620/tags',
              },
            },
          },
          id: 2620,
          attributes: {
            text: 'hello',
          },
        },
      ],
    };

    const output = {
      post: {
        2620: {
          type: 'post',
          id: 2620,
          attributes: {
            text: 'hello',
          },
          relationships: {
            tags: {
              data: [
                {
                  id: 4,
                  type: 'tag',
                },
              ],
              links: {
                camelCase: 'http://example.com/api/v1/post/2620/tags',
              },
            },
          },
        },
      },
    };

    const result = normalize(json);

    expect(result).to.deep.equal(output);
  });
});

describe('meta', () => {
  const json = {
    data: [
      {
        type: 'post',
        relationships: {
          question: {
            data: {
              type: 'question',
              id: '295',
            },
          },
        },
        id: 2620,
        attributes: {
          text: 'hello',
        },
      },
    ],
  };

  const output = {
    post: {
      2620: {
        type: 'post',
        id: 2620,
        attributes: {
          text: 'hello',
        },
        relationships: {
          question: {
            data: {
              id: '295',
              type: 'question',
            },
          },
        },
      },
    },
    meta: {
      'posts/me': {
        data: [
          {
            id: 2620,
            type: 'post',
            relationships: {
              question: {
                data: {
                  type: 'question',
                  id: '295',
                },
              },
            },
          },
        ],
      },
    },
  };

  const json2 = {
    data: [
      {
        type: 'post',
        relationships: {
          question: {
            data: {
              type: 'question',
              id: '295',
            },
          },
        },
        id: 2620,
        attributes: {
          text: 'hello',
        },
      },
    ],
    links: {
      next: 'http://example.com/api/v1/posts/friends_feed/superyuri?page[cursor]=5037',
      first: 'http://api.postie.loc/v1/posts/friends_feed/superyuri?page[cursor]=0',
    },
  };

  const output2 = {
    post: {
      2620: {
        type: 'post',
        id: 2620,
        attributes: {
          text: 'hello',
        },
        relationships: {
          question: {
            data: {
              id: '295',
              type: 'question',
            },
          },
        },
      },
    },
    meta: {
      'posts/me': {
        data: [
          {
            type: 'post',
            id: 2620,
            relationships: {
              question: {
                data: {
                  type: 'question',
                  id: '295',
                },
              },
            },
          },
        ],
        links: {
          next: 'http://example.com/api/v1/posts/friends_feed/superyuri?page[cursor]=5037',
          first: 'http://api.postie.loc/v1/posts/friends_feed/superyuri?page[cursor]=0',
        },
      },
    },
  };

  const output3 = {
    post: {
      2620: {
        type: 'post',
        id: 2620,
        attributes: {
          text: 'hello',
        },
        relationships: {
          question: {
            data: {
              id: '295',
              type: 'question',
            },
          },
        },
      },
    },
    meta: {
      'posts/me': {
        '?some=query': {
          data: [
            {
              type: 'post',
              id: 2620,
              relationships: {
                question: {
                  data: {
                    type: 'question',
                    id: '295',
                  },
                },
              },
            },
          ],
          links: {
            next: 'http://example.com/api/v1/posts/friends_feed/superyuri?page[cursor]=5037',
            first: 'http://api.postie.loc/v1/posts/friends_feed/superyuri?page[cursor]=0',
          },
        },
        links: {
          next: 'http://example.com/api/v1/posts/friends_feed/superyuri?page[cursor]=5037',
          first: 'http://api.postie.loc/v1/posts/friends_feed/superyuri?page[cursor]=0',
        },
      },
    },
  };

  it('meta, no links', () => {
    const result = normalize(json, { endpoint: 'posts/me' });

    expect(result).to.deep.equal(output);
  });

  it('meta, with links', () => {
    const result = normalize(json2, { endpoint: 'posts/me' });

    expect(result).to.deep.equal(output2);
  });

  it('meta, filter works', () => {
    const result = normalize(json2, { endpoint: 'posts/me?some=query' });

    expect(result).to.deep.equal(output2);
  });

  it('meta, disable filter option works', () => {
    const result = normalize(json2, { endpoint: 'posts/me?some=query', filterEndpoint: false });

    expect(result).to.deep.equal(output3);
  });

  it('meta, meta is provided by JSON API service', () => {
    const json3 = {
      data: [
        {
          type: 'post',
          relationships: {
            question: {
              data: {
                type: 'question',
                id: '295',
              },
            },
          },
          id: 2620,
          attributes: {
            text: 'hello',
          },
        },
      ],
      meta: {
        next: 'http://example.com/api/v1/posts/friends_feed/superyuri?page[cursor]=5037',
        first: 'http://api.postie.loc/v1/posts/friends_feed/superyuri?page[cursor]=0',
      },
    };

    const output3 = {
      post: {
        2620: {
          type: 'post',
          id: 2620,
          attributes: {
            text: 'hello',
          },
          relationships: {
            question: {
              data: {
                id: '295',
                type: 'question',
              },
            },
          },
        },
      },
      meta: {
        'posts/me': {
          data: [
            {
              type: 'post',
              id: 2620,
              relationships: {
                question: {
                  data: {
                    type: 'question',
                    id: '295',
                  },
                },
              },
            },
          ],
          meta: {
            next: 'http://example.com/api/v1/posts/friends_feed/superyuri?page[cursor]=5037',
            first: 'http://api.postie.loc/v1/posts/friends_feed/superyuri?page[cursor]=0',
          },
        },
      },
    };
    const result = normalize(json3, { endpoint: 'posts/me' });

    expect(result).to.deep.equal(output3);
  });

  it('empty collection', () => {
    const emptyJson = {
      data: [
        {
          type: 'post',
          id: 1,
          attributes: {
            text: 'hello',
          },
          relationships: {
            comments: {
              data: [],
            },
          },
        },
      ],
    };

    const output = {
      post: {
        1: {
          type: 'post',
          id: 1,
          attributes: {
            text: 'hello',
          },
          relationships: {
            comments: {
              data: [],
            },
          },
        },
      },
    };

    const result = normalize(emptyJson);

    expect(result).to.deep.equal(output);
  });
});

describe('complex', () => {
  const json = {
    data: [
      {
        attributes: {
          yday: 228,
          text: 'Какие качества Вы больше всего цените в женщинах?',
          slug: 'tbd',
        },
        id: 29,
        relationships: {
          'post-blocks': {
            data: [
              {
                type: 'post-block',
                id: 4601,
              },
              {
                type: 'post-block',
                id: 2454,
              },
            ],
          },
        },
        type: 'question',
      },
    ],
    included: [
      {
        attributes: {},
        id: 4601,
        relationships: {
          user: {
            data: {
              type: 'user',
              id: 1,
            },
          },
          posts: {
            data: [
              {
                type: 'post',
                id: 4969,
              },
              {
                type: 'post',
                id: 1606,
              },
            ],
          },
        },
        type: 'post-block',
      },
      {
        attributes: {},
        id: 2454,
        relationships: {
          user: {
            data: {
              type: 'user',
              id: 1,
            },
          },
          posts: {
            data: [
              {
                type: 'post',
                id: 4969,
              },
              {
                type: 'post',
                id: 1606,
              },
            ],
          },
        },
        links: {
          post_blocks: 'http://link.com'
        },
        type: 'post-block',
      },
      {
        type: 'user',
        attributes: {
          slug: 'superyuri',
        },
        id: 1,
      },
      {
        type: 'post',
        id: 1606,
        attributes: {
          text: 'hello1',
        },
      },
      {
        type: 'post',
        id: 4969,
        attributes: {
          text: 'hello2',
        },
        meta: {
          expires_at: 1513868982,
        },
      },
    ],
  };

  const output = {
    question: {
      29: {
        type: 'question',
        id: 29,
        attributes: {
          yday: 228,
          text: 'Какие качества Вы больше всего цените в женщинах?',
          slug: 'tbd',
        },
        relationships: {
          'post-blocks': {
            data: [
              {
                id: 4601,
                type: 'postBlock',
              },
              {
                id: 2454,
                type: 'postBlock',
              },
            ],
          },
        },
      },
    },
    'post-block': {
      2454: {
        type: 'postBlock',
        id: 2454,
        links: {
          post_blocks: 'http://link.com'
        },
        attributes: {},
        relationships: {
          user: {
            data: {
              type: 'user',
              id: 1,
            },
          },
          posts: {
            data: [
              {
                type: 'post',
                id: 4969,
              },
              {
                type: 'post',
                id: 1606,
              },
            ],
          },
        },
      },
      4601: {
        type: 'postBlock',
        id: 4601,
        attributes: {},
        relationships: {
          user: {
            data: {
              type: 'user',
              id: 1,
            },
          },
          posts: {
            data: [
              {
                type: 'post',
                id: 4969,
              },
              {
                type: 'post',
                id: 1606,
              },
            ],
          },
        },
      },
    },
    user: {
      1: {
        type: 'user',
        id: 1,
        attributes: {
          slug: 'superyuri',
        },
      },
    },
    post: {
      1606: {
        type: 'post',
        id: 1606,
        attributes: {
          text: 'hello1',
        },
      },
      4969: {
        type: 'post',
        id: 4969,
        attributes: {
          text: 'hello2',
        },
        meta: {
          expires_at: 1513868982,
        },
      },
    },
  };

  const output2 = {
    question: {
      29: {
        type: 'question',
        id: 29,
        attributes: {
          yday: 228,
          text: 'Какие качества Вы больше всего цените в женщинах?',
          slug: 'tbd',
        },
        relationships: {
          postBlocks: {
            data: [
              {
                id: 4601,
                type: 'postBlock',
              },
              {
                id: 2454,
                type: 'postBlock',
              },
            ],
          },
        },
      },
    },
    postBlock: {
      2454: {
        type: 'postBlock',
        id: 2454,
        links: {
          postBlocks: 'http://link.com'
        },
        attributes: {},
        relationships: {
          user: {
            data: {
              type: 'user',
              id: 1,
            },
          },
          posts: {
            data: [
              {
                type: 'post',
                id: 4969,
              },
              {
                type: 'post',
                id: 1606,
              },
            ],
          },
        },
      },
      4601: {
        type: 'postBlock',
        id: 4601,
        attributes: {},
        relationships: {
          user: {
            data: {
              type: 'user',
              id: 1,
            },
          },
          posts: {
            data: [
              {
                type: 'post',
                id: 4969,
              },
              {
                type: 'post',
                id: 1606,
              },
            ],
          },
        },
      },
    },
    user: {
      1: {
        type: 'user',
        id: 1,
        attributes: {
          slug: 'superyuri',
        },
      },
    },
    post: {
      1606: {
        type: 'post',
        id: 1606,
        attributes: {
          text: 'hello1',
        },
      },
      4969: {
        type: 'post',
        id: 4969,
        attributes: {
          text: 'hello2',
        },
        meta: {
          expiresAt: 1513868982,
        },
      },
    },
  };

  const output3 = {
    question: {
      29: {
        type: 'question',
        id: 29,
        attributes: {
          yday: 228,
          text: 'Какие качества Вы больше всего цените в женщинах?',
          slug: 'tbd',
        },
        relationships: {
          postBlocks: {
            data: [
              {
                id: 4601,
                type: 'post-block',
              },
              {
                id: 2454,
                type: 'post-block',
              },
            ],
          },
        },
      },
    },
    postBlock: {
      2454: {
        type: 'post-block',
        id: 2454,
        links: {
          postBlocks: 'http://link.com'
        },
        attributes: {},
        relationships: {
          user: {
            data: {
              type: 'user',
              id: 1,
            },
          },
          posts: {
            data: [
              {
                type: 'post',
                id: 4969,
              },
              {
                type: 'post',
                id: 1606,
              },
            ],
          },
        },
      },
      4601: {
        type: 'post-block',
        id: 4601,
        attributes: {},
        relationships: {
          user: {
            data: {
              type: 'user',
              id: 1,
            },
          },
          posts: {
            data: [
              {
                type: 'post',
                id: 4969,
              },
              {
                type: 'post',
                id: 1606,
              },
            ],
          },
        },
      },
    },
    user: {
      1: {
        type: 'user',
        id: 1,
        attributes: {
          slug: 'superyuri',
        },
      },
    },
    post: {
      1606: {
        type: 'post',
        id: 1606,
        attributes: {
          text: 'hello1',
        },
      },
      4969: {
        type: 'post',
        id: 4969,
        attributes: {
          text: 'hello2',
        },
        meta: {
          expiresAt: 1513868982,
        },
      },
    },
  };

  it('test data camelizeKeys: false', () => {
    const result = normalize(json, { camelizeKeys: false });

    expect(result).to.deep.eql(output);
  });

  it('test data camelizeKeys: true', () => {
    const result = normalize(json, { camelizeKeys: true });

    expect(result).to.deep.eql(output2);
  });

  it('test data camelizeTypeValues: false', () => {
    const result = normalize(json, { camelizeTypeValues: false });

    expect(result).to.deep.eql(output3);
  });

  it('test data camelizeTypeValues: true', () => {
    const result = normalize(json, { camelizeTypeValues: true });

    expect(result).to.deep.eql(output2);
  });

  const outputMeta = {
    '/post': {
      data: [
        {
          type: 'question',
          id: 29,
          relationships: {
            'post-blocks': {
              data: [
                {
                  type: 'postBlock',
                  id: 4601,
                },
                {
                  type: 'postBlock',
                  id: 2454,
                },
              ],
            },
          },
        },
      ],
    },
  };

  const outputMeta2 = {
    '/post': {
      data: [
        {
          type: 'question',
          id: 29,
          relationships: {
            postBlocks: {
              data: [
                {
                  type: 'postBlock',
                  id: 4601,
                },
                {
                  type: 'postBlock',
                  id: 2454,
                },
              ],
            },
          },
        },
      ],
    },
  };

  const outputMeta3 = {
    '/post': {
      data: [
        {
          type: 'question',
          id: 29,
          relationships: {
            'postBlocks': {
              data: [
                {
                  type: 'post-block',
                  id: 4601,
                },
                {
                  type: 'post-block',
                  id: 2454,
                },
              ],
            },
          },
        },
      ],
    },
  };

  it('test meta, camelizeKeys: false', () => {
    const result = normalize(json, { endpoint: '/post', camelizeKeys: false });

    expect(result.meta).to.deep.eql(outputMeta);
  });

  it('test meta, camelizeKeys: true', () => {
    const result = normalize(json, { endpoint: '/post', camelizeKeys: true });

    expect(result.meta).to.deep.eql(outputMeta2);
  });

  it('test meta, camelizeTypeValues: false', () => {
    const result = normalize(json, { endpoint: '/post', camelizeTypeValues: false });

    expect(result.meta).to.deep.eql(outputMeta3);
  });

  it('test meta, camelizeTypeValues: true', () => {
    const result = normalize(json, { endpoint: '/post', camelizeTypeValues: true });

    expect(result.meta).to.deep.eql(outputMeta2);
  });
});

describe('lazy loading', () => {
  const json = {
    data: [
      {
        id: 29,
        attributes: {
          yday: 228,
          text: 'Какие качества Вы больше всего цените в женщинах?',
          slug: 'tbd',
        },
        relationships: {
          movie: {
            links: {
              self:
                'http://localhost:3000/api/v1/actor/1c9d234b-66c4-411e-b785-955d57db5536/relationships/movie',
              related:
                'http://localhost:3000/api/v1/actor/1c9d234b-66c4-411e-b785-955d57db5536/movie',
            },
          },
        },
        type: 'question',
      },
    ],
  };

  const output = {
    question: {
      29: {
        type: 'question',
        id: 29,
        attributes: {
          yday: 228,
          text: 'Какие качества Вы больше всего цените в женщинах?',
          slug: 'tbd',
        },
        relationships: {
          movie: {
            links: {
              self:
                'http://localhost:3000/api/v1/actor/1c9d234b-66c4-411e-b785-955d57db5536/relationships/movie',
              related:
                'http://localhost:3000/api/v1/actor/1c9d234b-66c4-411e-b785-955d57db5536/movie',
            },
          },
        },
      },
    },
  };

  it('basic test', () => {
    const result = normalize(json);

    expect(result).to.deep.equal(output);
  });
});

describe('relationship meta', () => {
  const json1 = {
    data: [
      {
        type: 'post',
        relationships: {
          questions: {
            data: [
              {
                type: 'question',
                id: '295',
              },
            ],
            meta: {
              membership: [
                {
                  post_id: '2620',
                  question_id: '295',
                  created_at: '2017-11-22',
                  updated_at: '2017-11-26',
                },
              ],
              'review-status': {
                content_flags: '4',
              },
            },
          },
        },
        id: '2620',
        attributes: {
          text: 'hello',
        },
      },
    ],
  };

  const output1 = {
    post: {
      2620: {
        type: 'post',
        id: '2620',
        attributes: {
          text: 'hello',
        },
        relationships: {
          questions: {
            data: [
              {
                id: '295',
                type: 'question',
              },
            ],
            meta: {
              membership: [
                {
                  postId: '2620',
                  questionId: '295',
                  createdAt: '2017-11-22',
                  updatedAt: '2017-11-26',
                },
              ],
              reviewStatus: {
                contentFlags: '4',
              },
            },
          },
        },
      },
    },
  };

  it('meta in relationship', () => {
    const result = normalize(json1);

    expect(result).to.deep.equal(output1);
  });

  it('we should store links and metadata if no data received', () => {
    const input = {
      meta: {
        'total-pages': 13,
      },
      links: {
        self: 'http://example.com/articles?page[number]=3&page[size]=1',
        first: 'http://example.com/articles?page[number]=1&page[size]=1',
        prev: 'http://example.com/articles?page[number]=2&page[size]=1',
        next: 'http://example.com/articles?page[number]=4&page[size]=1',
        last: 'http://example.com/articles?page[number]=13&page[size]=1',
      },
    };

    const output = {
      meta: {
        '/post': {
          data: {},
          links: {
            self: 'http://example.com/articles?page[number]=3&page[size]=1',
            first: 'http://example.com/articles?page[number]=1&page[size]=1',
            prev: 'http://example.com/articles?page[number]=2&page[size]=1',
            next: 'http://example.com/articles?page[number]=4&page[size]=1',
            last: 'http://example.com/articles?page[number]=13&page[size]=1',
          },
          meta: { 'total-pages': 13 },
        },
      },
    };

    const result = normalize(input, { endpoint: '/post' });

    expect(result).to.deep.equal(output);
  });
});
