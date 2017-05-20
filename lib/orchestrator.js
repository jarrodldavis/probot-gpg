const gpg = require('./gpg');
const createStatus = require('./create-status');

module.exports = async (robot, event, context) => {
  const github = await robot.auth(event.payload.installation.id);
  const pullRequest = event.payload.pull_request;
  const headSha = pullRequest.head.sha;

  const diff = await github.repos.compareCommits(context.repo({
    base: pullRequest.base.sha,
    head: headSha
  }));

  const allCommitsVerified = diff.commits.every(entry => gpg(entry.commit));

  return createStatus(github, context, headSha, allCommitsVerified);
};
