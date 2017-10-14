module.exports = function (config, commit) {
  if (config.ignoreWebFlow === true && commit.login === 'web-flow') {
    return 'web-flow-ignored';
  }

  if (commit.verification === undefined) {
    return 'error';
  }

  if (commit.verification.verified === true) {
    return 'success';
  }

  return 'failure';
};
