module.exports = class ContextMock {
  repo(object) {
    return Object.assign({}, {
      owner: 'owner',
      repo: 'repo'
    }, object);
  }
};
