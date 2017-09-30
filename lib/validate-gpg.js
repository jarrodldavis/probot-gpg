function validateCommit(overallStatus, entry) {
  const commit = entry.commit;
  if (commit.verification === undefined) {
    return 'error';
  }

  if (commit.verification.verified === true) {
    return overallStatus;
  }

  return 'failure';
}

module.exports = async (github, context, baseSha, headSha) => {
  github.acceptUrls['/repos/:owner/:repo/compare/:base...:head'] = 'application/vnd.github.cryptographer-preview';
  const response = await github.repos.compareCommits(context.repo({
    base: baseSha,
    head: headSha
  }));

  return response.data.commits.reduce(validateCommit, 'success');
};
