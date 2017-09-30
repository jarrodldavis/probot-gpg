const assert = require('assert');
const sinon = require('sinon');
const validateGpg = require('../lib/validate-gpg');

const GitHubMock = require('./mocks/github');
const ContextMock = require('./mocks/context');

const createCommit = require('./utils/create-commit');

describe('validate-gpg', () => {
  function testScenario(baseVerified, middleVerified, headVerified) {
    const [baseCommit, middleCommit, headCommit] = [baseVerified, middleVerified, headVerified].map(createCommit);
    const githubMock = new GitHubMock();

    sinon.stub(githubMock.repos, 'compareCommits').resolves({
      data: { commits: [headCommit, middleCommit, baseCommit] }
    });

    return validateGpg(githubMock, new ContextMock(), baseCommit.commit.sha, headCommit.commit.sha);
  }

  it('should return "success" if all of the commits have a verified GPG signature', () => {
    return testScenario(true, true, true).then(result => assert.equal(result, 'success'));
  });

  it('should return "failure" if all of the commits have an invalid GPG signature', () => {
    return testScenario(false, false, false).then(result => assert.equal(result, 'failure'));
  });

  it('should return "failure" if one, but not all, of the commits has an invalid GPG signature', async () => {
    return testScenario(true, false, true).then(result => assert.equal(result, 'failure'));
  });

  it('should return "error" if a commit does not have GPG signature information', () => {
    return testScenario(true, 'error', true).then(result => assert.equal(result, 'error'));
  });
});
