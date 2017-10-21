class RepoMock {
  async compareCommits() {
    return Promise.resolve();
  }
  async createStatus() {
    return Promise.resolve();
  }
}

class GitHubMock {
  constructor() {
    this.repos = new RepoMock();
    this.acceptUrls = [];
  }
}

module.exports = class ContextMock {
  constructor(payload) {
    this.payload = payload;
    this.github = new GitHubMock();
  }

  repo(object) {
    return Object.assign({}, {
      owner: 'owner',
      repo: 'repo'
    }, object);
  }
};
