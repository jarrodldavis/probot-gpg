module.exports = async function (context) {
  const pullRequest = context.payload.pull_request
  const base = pullRequest.base.sha
  const head = pullRequest.head.sha

  context.log.debug({ base, head }, 'Retrieving commits')

  const response = await context.github.repos.compareCommits(context.repo({ base, head }))

  context.log.debug({
    base,
    head,
    count: response.data.commits.length,
    commits: response.data.commits.map(commit => commit.sha)
  }, 'Retrieved commits')

  return response.data.commits
}
