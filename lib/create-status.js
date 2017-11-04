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
}

module.exports = async (context, gpgStatus) => {
  const statusParams = {
    sha: context.payload.pull_request.head.sha,
    context: 'GPG'
  }

  const log = context.log.child({ status: gpgStatus, sha: statusParams.sha })
  log.debug('Applying status')

  switch (gpgStatus) {
    case 'success':
      Object.assign(statusParams, statuses.success)
      break
    case 'failure':
      Object.assign(statusParams, statuses.failure)
      break
    default:
      Object.assign(statusParams, statuses.error)
      break
  }

  await context.github.repos.createStatus(context.repo(statusParams))

  log.info('Status applied')
}
