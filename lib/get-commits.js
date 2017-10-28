module.exports = async function (context) {
  const pullRequest = context.payload.pull_request;
  const base = pullRequest.base.sha;
  const head = pullRequest.head.sha;

  context.log.debug(`Retrieving commits for comparison ${base}...${head}`);

  const response = await context.github.repos.compareCommits(context.repo({ base, head }));

  context.log.debug(`Retrieved ${response.data.commits.length} commits for comparison ${base}...${head}`);

  return response.data.commits;
};
