const gpg = require('./gpg');
const createStatus = require('./create-status');

module.exports = async (robot, event, context) => {
  const github = await robot.auth(event.payload.installation.id);
  const pullRequest = event.payload.pull_request;
  const headSha = pullRequest.head.sha;

  let allCommitsVerified;
  try {
    allCommitsVerified = await gpg(github, pullRequest.base.sha, headSha);
  } catch (err) {
    allCommitsVerified = 'error';
  }

  return createStatus(github, context, headSha, allCommitsVerified);
};
