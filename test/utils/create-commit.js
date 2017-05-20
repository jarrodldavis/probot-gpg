const createSha = require('./create-sha');

module.exports = verified => {
  if (verified === 'error') {
    return {
      commit: { sha: createSha() }
    };
  }

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
