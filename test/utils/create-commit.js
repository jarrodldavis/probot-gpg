const createSha = require('./create-sha');

function randomStatus() {
  const statuses = ['success', 'failure', 'error'];
  const max = statuses.length - 1;
  const index = Math.floor(Math.random() * max);
  return statuses[index];
}

module.exports = (status, login) => {
  if (status === undefined) {
    status = randomStatus();
  }

  if (login === undefined) {
    login = 'jarrodldavis';
  }

  if (status === 'error') {
    return {
      commit: { login, sha: createSha() }
    };
  }

  return {
    commit: {
      login,
      sha: createSha(),
      verification: {
        verified: status === 'success',
        reason: status === 'success' ? 'valid' : 'bad_email'
      }
    }
  };
};
