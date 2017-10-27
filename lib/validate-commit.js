module.exports = function (context, commit) {
  if (commit.verification === undefined) {
    return 'error';
  }

  if (commit.verification.verified === true) {
    return 'success';
  }

  return 'failure';
};
