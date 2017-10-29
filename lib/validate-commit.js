module.exports = function (context, commit) {
  context.log.debug(`Verifying commit ${commit.sha}`)

  if (commit.commit.verification === undefined) {
    context.log.error(`Commit ${commit.sha} has no verification information`)
    return 'error'
  }

  if (commit.commit.verification.verified === true) {
    context.log.debug(`Commit ${commit.sha} has passed verification`)
    return 'success'
  }

  context.log.info(`Commit ${commit.sha} has failed verification`)
  return 'failure'
}
