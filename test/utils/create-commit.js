const createSha = require('./create-sha');

function randomStatus() {
  const statuses = ['success', 'failure', 'error'];
  const max = statuses.length - 1;
  const index = Math.floor(Math.random() * max);
  return statuses[index];
}

module.exports = verified => {
  if (verified === undefined) {
    verified = randomStatus();
  }

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
