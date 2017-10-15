const getCommits = require('./get-commits');
const getConfig = require('./get-config');
const validateCommit = require('./validate-commit');
const reduceStatuses = require('./reduce-statuses');
const createStatus = require('./create-status');

module.exports = async (robot, context) => {
  const github = await robot.auth(context.payload.installation.id);

  let status;
  try {
    const [commits, config] = await Promise.all([getCommits(github, context), getConfig(context)]);
    const statusChain = commits.map(commit => validateCommit(config, commit));
    status = reduceStatuses(statusChain);
  } catch (err) {
    status = 'error';
  }

  return createStatus(github, context, status);
};
