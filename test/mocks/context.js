module.exports = {
  repo: object => {
    return Object.assign({}, {
      owner: 'owner',
      repo: 'repo'
    }, object);
  }
};
