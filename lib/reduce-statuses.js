module.exports = function (context, statusChain) {
  return statusChain.reduce((overallStatus, currentStatus) => {
    if (currentStatus === 'error' || overallStatus === 'error') {
      return 'error';
    }

    if (overallStatus === 'failure') {
      return 'failure';
    }

    return currentStatus;
  });
};
