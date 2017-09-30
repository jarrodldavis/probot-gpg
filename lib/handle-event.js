const validateGpg = require('./validate-gpg');
const createStatus = require('./create-status');

module.exports = async (robot, context) => {
  const github = await robot.auth(context.payload.installation.id);
  const pullRequest = context.payload.pull_request;
  const headSha = pullRequest.head.sha;

  let status;
  try {
    status = await validateGpg(github, context, pullRequest.base.sha, headSha);
  } catch (err) {
    status = 'error';
  }

  return createStatus(github, context, status);
};
