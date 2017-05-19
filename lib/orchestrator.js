const gpg = require('./gpg');
const createStatus = require('./create-status');

module.exports = async (github, context, pullRequest) => {
  const headSha = pullRequest.head.sha;
  const diff = await github.repos.compareCommits(context.repo({
    base: pullRequest.base.sha,
    head: headSha
  }));

  const allCommitsVerified = diff.commits.every(entry => gpg(entry.commit));
  return createStatus(github, context, headSha, allCommitsVerified);
};