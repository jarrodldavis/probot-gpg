const expect = require('expect');
const validateGpg = require('../lib/validate-gpg');

const GitHubMock = require('./mocks/github');
const ContextMock = require('./mocks/context');

const createCommit = require('./utils/create-commit');

describe('validate-gpg', () => {
  function testScenario(baseVerified, middleVerified, headVerified) {
    const [baseCommit, middleCommit, headCommit] = [baseVerified, middleVerified, headVerified].map(createCommit);
    const githubMock = new GitHubMock();

    expect.spyOn(githubMock.repos, 'compareCommits').andReturn(Promise.resolve({
      commits: [headCommit, middleCommit, baseCommit]
    }));

    return validateGpg(githubMock, new ContextMock(), baseCommit.commit.sha, headCommit.commit.sha);
  }

  it('should return true if all of the commits have a verified GPG signature', () => {
    return testScenario(true, true, true).then(result => expect(result).toBe(true));
  });

  it('should return false if all of the commits have an invalid GPG signature', () => {
    return testScenario(false, false, false).then(result => expect(result).toBe(false));
  });

  it('should return false if one, but not all, of the commits has an invalid GPG signature', async () => {
    return testScenario(true, false, true).then(result => expect(result).toBe(false));
  });

  it('should throw if a commit does not have GPG signature information', () => {
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
