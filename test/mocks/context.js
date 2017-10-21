module.exports = class ContextMock {
  constructor(payload, config) {
    this.payload = payload;
    this.configObj = config;
  }

  repo(object) {
    return Object.assign({}, {
      owner: 'owner',
      repo: 'repo'
    }, object);
  }

  async config() {
    return Promise.resolve(this.configObj);
  }
};
