module.exports = (baseSha, headSha) => {
  return {
    payload: {
      installation: { id: Math.ceil(Math.random() * 100) },
      pull_request: { // eslint-disable-line camelcase
        base: { sha: baseSha },
        head: { sha: headSha }
      }
    }
  };
};
