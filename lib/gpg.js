module.exports = commit => {
  if (commit.verification === undefined) {
    throw new Error('The verification status of the commit cannot be determined');
  }

  return commit.verification.verified === true;
};
