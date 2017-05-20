function isCommitVerified(commit) {
  if (commit.verification === undefined) {
    throw new Error('The verification status of the commit cannot be determined');
  }

  return commit.verification.verified === true;
}

module.exports = async (github, context, baseSha, headSha) => {
  const diff = await github.repos.compareCommits(context.repo({
    base: baseSha,
    head: headSha
  }));

  return diff.commits.every(entry => isCommitVerified(entry.commit));
};
