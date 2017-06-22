module.exports = class ContextMock {
  constructor(payload) {
    this.payload = payload;
  }

  repo(object) {
    return Object.assign({}, {
      owner: 'owner',
      repo: 'repo'
    }, object);
  }
};
