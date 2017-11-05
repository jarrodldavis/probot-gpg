module.exports = function (context, commit) {
  const log = context.log.child({ sha: commit.sha })
  log.debug('Verifying commit')

  if (commit.commit.verification === undefined) {
    log.error('Commit has no verification information')
    return 'error'
  }

  if (commit.commit.verification.verified === true) {
    log.debug('Commit has passed verification')
    return 'success'
  }

  log.info({ reason: commit.commit.verification.reason }, 'Commit has failed verification')
  return 'failure'
}
