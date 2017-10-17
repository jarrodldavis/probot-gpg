module.exports = function (config, commit) {
  if (commit.login === 'web-flow' && config.ignoreWebFlow === true) {
    if (commit.verification === undefined) {
      return 'web-flow-ignored';
    }

    if (commit.verification.verified === true) {
      return 'success';
    }

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
