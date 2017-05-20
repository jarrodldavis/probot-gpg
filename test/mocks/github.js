class RepoMock {
  compareCommits() {
    Promise.resolve();
  }
  createStatus() {
    Promise.resolve();
  }
}

module.exports = class GitHubMock {
  constructor() {
    this.repos = new RepoMock();
  }
};
