module.exports = function (context, statusChain) {
  context.log.debug(`Reducing status chain ${statusChain}`);

  const reduced = statusChain.reduce((overallStatus, currentStatus) => {
    if (currentStatus === 'error' || overallStatus === 'error') {
      return 'error';
    }

    if (overallStatus === 'failure') {
      return 'failure';
    }

    return currentStatus;
  });

  context.log.debug(`Reduced status chain to ${reduced}`);

  return reduced;
};
