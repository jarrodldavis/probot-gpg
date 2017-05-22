module.exports = class RobotMock {
  constructor(githubMock) {
    this.githubMock = githubMock;
  }

  on() {
    return this;
  }

  auth() {
    return Promise.resolve(this.githubMock);
  }
};
