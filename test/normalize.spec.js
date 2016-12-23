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
        data: {
          post: '2620'
        }
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
        data: {
          post: '2620'
        },
        links: {
          next: "http://example.com/api/v1/posts/friends_feed/superyuri?page[cursor]=5037",
          first: "http://api.postie.loc/v1/posts/friends_feed/superyuri?page[cursor]=0"
        }
      }
    }
  }

  it('meta, no links', () => {
    const result = normalize(json, 'posts/me');

    expect(isEqual(result, output)).to.be.true;
  });

  it('meta, with links', () => {
    const result = normalize(json2, 'posts/me');

    expect(isEqual(result, output2)).to.be.true;
  });

  it('meta, filter works', () => {
    const result = normalize(json2, 'posts/me?some=query');

    expect(isEqual(result, output2)).to.be.true;
  });

  it('meta, disable filter option works', () => {
    const result = normalize(json2, 'posts/me?some=query', { filterEndpoint: false });

    expect(isEqual(result, output2)).to.be.false;
  });


});
