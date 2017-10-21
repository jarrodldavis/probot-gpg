const getCommits = require('./get-commits');
const validateCommit = require('./validate-commit');
const reduceStatuses = require('./reduce-statuses');
const createStatus = require('./create-status');

module.exports = async (robot, context) => {
  let status;
  try {
    const commits = await getCommits(context);
    const statusChain = commits.map(validateCommit);
    status = reduceStatuses(statusChain);
  } catch (err) {
    status = 'error';
  }

  return createStatus(context, status);
};
