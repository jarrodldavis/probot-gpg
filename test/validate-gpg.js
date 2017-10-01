const assert = require('assertive');
const sinon = require('sinon');
const validateGpg = require('../lib/validate-gpg');

const GitHubMock = require('./mocks/github');
const ContextMock = require('./mocks/context');

const createCommit = require('./utils/create-commit');

describe('validate-gpg', () => {
  async function testScenario(baseVerified, middleVerified, headVerified) {
    const [baseCommit, middleCommit, headCommit] = [baseVerified, middleVerified, headVerified].map(createCommit);
    const githubMock = new GitHubMock();

    sinon.stub(githubMock.repos, 'compareCommits').resolves({
      data: { commits: [headCommit, middleCommit, baseCommit] }
    });

    return assert.resolves(validateGpg(githubMock, new ContextMock(), baseCommit.commit.sha, headCommit.commit.sha));
  }

  it('should return "success" if all of the commits have a verified GPG signature', async () => {
    return assert.equal(await testScenario(true, true, true), 'success');
  });

  it('should return "failure" if all of the commits have an invalid GPG signature', async () => {
    return assert.equal(await testScenario(false, false, false), 'failure');
  });

  it('should return "failure" if one, but not all, of the commits has an invalid GPG signature', async () => {
    return assert.equal(await testScenario(true, false, true), 'failure');
  });

  it('should return "error" if a commit does not have GPG signature information', async () => {
    return assert.equal(await testScenario(true, 'error', true), 'error');
  });
});
