const createIntegrationId = require('./create-integration-id');

module.exports = (baseSha, headSha) => {
  return {
    payload: {
      installation: { id: createIntegrationId() },
      pull_request: { // eslint-disable-line camelcase
        base: { sha: baseSha },
        head: { sha: headSha }
      }
    }
  };
};
