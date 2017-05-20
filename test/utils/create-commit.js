const createSha = require('./create-sha');

module.exports = verified => {
  return {
    commit: {
      sha: createSha(),
      verification: {
        verified,
        reason: verified ? 'valid' : 'bad_email'
      }
    }
  };
};
