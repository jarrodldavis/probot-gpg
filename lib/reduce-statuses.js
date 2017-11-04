module.exports = function (context, statusChain) {
  context.log.debug({ statusChain }, 'Reducing status chain')

  const reduced = statusChain.reduce((overallStatus, currentStatus) => {
    if (currentStatus === 'error' || overallStatus === 'error') {
      return 'error'
    }

    if (overallStatus === 'failure') {
      return 'failure'
    }

    return currentStatus
  })

  context.log.debug({ reduced }, 'Reduced status chain')

  return reduced
}
