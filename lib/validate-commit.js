module.exports = function (commit) {
  if (commit.verification === undefined) {
    return 'error';
  }

  if (commit.verification.verified === true) {
    return 'success';
  }

  return 'failure';
};
