const createLogStubs = require('../utils/create-log-stubs');

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

class ContextMock {
  constructor(payload, event, webhookId) {
    this.payload = payload;
    this.event = event;
    this.id = webhookId;
    this.github = new GitHubMock();
  }

  repo(object) {
    return Object.assign({}, {
      owner: 'owner',
      repo: 'repo'
    }, object);
  }
}

class GpgEventContextMock extends ContextMock {
  constructor(payload, event, webhookId) {
    super(payload, event, webhookId);
    this.log = createLogStubs();
  }
}

module.exports = { ProbotContextMock: ContextMock, GpgEventContextMock };
