function isCommitVerified(commit) {
  if (commit.verification === undefined) {
    throw new Error('The verification status of the commit cannot be determined');
  }

  return commit.verification.verified === true;
}

module.exports = async (github, context, baseSha, headSha) => {
  github.acceptUrls['/repos/:owner/:repo/compare/:base...:head'] = 'application/vnd.github.cryptographer-preview';
  const response = await github.repos.compareCommits(context.repo({
    base: baseSha,
    head: headSha
  }));

  return response.data.commits.every(entry => isCommitVerified(entry.commit));
};
