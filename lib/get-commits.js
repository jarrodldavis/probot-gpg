module.exports = async function (context) {
  const pullRequest = context.payload.pull_request;
  const response = await context.github.repos.compareCommits(context.repo({
    base: pullRequest.base.sha,
    head: pullRequest.head.sha
  }));

  return response.data.commits.map(entry => entry.commit);
};
