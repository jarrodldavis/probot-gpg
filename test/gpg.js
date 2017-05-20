const expect = require('expect');
const gpg = require('../lib/gpg');

const GitHubMock = require('./mocks/github');
const ContextMock = require('./mocks/context');

const createCommit = require('./utils/create-commit');

describe('gpg', () => {
  function testScenario(baseVerified, middleVerified, headVerified) {
    const [baseCommit, middleCommit, headCommit] = [baseVerified, middleVerified, headVerified].map(createCommit);
    const githubMock = new GitHubMock();

    expect.spyOn(githubMock.repos, 'compareCommits').andReturn(Promise.resolve({
      commits: [headCommit, middleCommit, baseCommit]
    }));

    return gpg(githubMock, new ContextMock(), baseCommit.commit.sha, headCommit.commit.sha);
  }

  it('should return true if the commit has a verified GPG signature', () => {
    return testScenario(true, true, true).then(result => expect(result).toBe(true));
  });

  it('should return false if the commit has an invalid GPG signature', () => {
    return testScenario(false, false, false).then(result => expect(result).toBe(false));
  });

  it('should throw if the commit does not have GPG signature information', () => {
    return testScenario(true, 'error', true)
      .catch(err => err)
      .then(result => {
        if (result instanceof Error) {
          expect(result.message).toBe('The verification status of the commit cannot be determined');
        } else {
          throw new TypeError('Expected error, got success result.');
        }
      });
  });
});
