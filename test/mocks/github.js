class RepoMock {
  async compareCommits() {
    return Promise.resolve();
  }
  async createStatus() {
    return Promise.resolve();
  }
}

module.exports = class GitHubMock {
  constructor() {
    this.repos = new RepoMock();
    this.acceptUrls = [];
  }
};
