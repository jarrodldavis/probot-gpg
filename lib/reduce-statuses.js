module.exports = function (statusChain) {
  return statusChain.reduce((overallStatus, currentStatus) => {
    if (currentStatus === 'error' || overallStatus === 'error') {
      return 'error';
    }

    if (overallStatus === 'failure') {
      return 'failure';
    }

    if (overallStatus === 'web-flow-ignored') {
      return 'web-flow-ignored';
    }

    return currentStatus;
  });
};
