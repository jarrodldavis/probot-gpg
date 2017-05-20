module.exports = class RobotMock {
  constructor(githubMock) {
    this.githubMock = githubMock;
  }

  auth() {
    return Promise.resolve(this.githubMock);
  }
};
