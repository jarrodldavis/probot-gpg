const statuses = {
  success: {
    state: 'success',
    description: 'All commits have a verified GPG signature'
  },
  failure: {
    state: 'failure',
    description: 'All commits must have a verified GPG signature',
    target_url: 'https://help.github.com/articles/about-gpg/' // eslint-disable-line camelcase
  },
  error: {
    state: 'error',
    description: 'An error occurred while checking the commit GPG status'
  }
};

module.exports = (github, context, commitSha, gpgStatus) => {
  const statusParams = {
    sha: commitSha,
    context: 'GPG'
  };

  switch (gpgStatus) {
    case true:
      Object.assign(statusParams, statuses.success);
      break;
    case false:
      Object.assign(statusParams, statuses.failure);
      break;
    default:
      Object.assign(statusParams, statuses.error);
      break;
  }

  return github.repos.createStatus(context.repo(statusParams));
};
