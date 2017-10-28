const createAppId = require('./create-app-id');

module.exports = (baseSha, headSha, { action, repoName, number } = {}) => {
  return {
    installation: { id: createAppId() },
    action,
    number,
    pull_request: { // eslint-disable-line camelcase
      base: { sha: baseSha },
      head: { sha: headSha },
      number
    },
    repository: {
      full_name: repoName // eslint-disable-line camelcase
    }
  };
};
