const statuses = {
  success: {
    state: 'success',
    description: 'All commits have a verified GPG signature'
  },
  'web-flow-ignored': {
    state: 'success',
    description: 'All non-web-flow commits have a verified GPG signature'
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

module.exports = async (github, context, gpgStatus) => {
  const statusParams = {
    sha: context.payload.pull_request.head.sha,
    context: 'GPG'
  };

  if (gpgStatus in statuses) {
    Object.assign(statusParams, statuses[gpgStatus]);
  } else {
    Object.assign(statusParams, statuses.error);
  }

  return github.repos.createStatus(context.repo(statusParams));
};
