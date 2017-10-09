const getCommits = require('./get-commits');
const validateCommit = require('./validate-commit');
const reduceStatuses = require('./reduce-statuses');
const createStatus = require('./create-status');

module.exports = async (robot, context) => {
  const github = await robot.auth(context.payload.installation.id);

  let status;
  try {
    const commits = await getCommits(github, context);
    const statusChain = commits.map(validateCommit);
    status = reduceStatuses(statusChain);
  } catch (err) {
    status = 'error';
  }

  return createStatus(github, context, status);
};
