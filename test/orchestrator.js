const expect = require('expect');
const mockery = require('mockery');
const contextMock = require('./mocks/context');
const createSha = require('./utils/create-sha');

const githubMock = {
  repos: {
    compareCommits: () => Promise.resolve()
  }
};

function arrangeOrchestrator(gpg, createStatus) {
  mockery.enable();
  mockery.registerMock('./gpg', gpg);
  mockery.registerMock('./create-status', createStatus);
  mockery.registerAllowable('../lib/orchestrator');
  const orchestratorUnderTest = require('../lib/orchestrator');
  mockery.disable();
  return orchestratorUnderTest;
}

function createCommitObject(verified) {
  return {
    commit: {
      sha: createSha(),
      verification: {
        verified,
        reason: verified ? 'valid' : 'bad_email'
      }
    }
  };
}

describe('orchestrator', () => {
  it('should orchestrate correctly when all commits are verified', async () => {
    // Arrange
    const gpgSpy = expect.createSpy().andReturn(true);
    const createStatusResult = { state: 'success' };
    const createStatusSpy = expect.createSpy().andReturn(Promise.resolve(createStatusResult));
    const orchestratorUnderTest = arrangeOrchestrator(gpgSpy, createStatusSpy);

    const baseCommit = createCommitObject(true);
    const baseSha = baseCommit.sha;
    const headCommit = createCommitObject(true);
    const headSha = headCommit.sha;

    expect.spyOn(githubMock.repos, 'compareCommits')
          .andReturn({
            commits: [baseCommit, headCommit]
          });

    // Act
    const result = await orchestratorUnderTest(githubMock, contextMock, {
      base: { sha: baseSha },
      head: { sha: headSha }
    });

    // Assert
    expect(githubMock.repos.compareCommits).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      base: baseSha,
      head: headSha
    });
    expect(gpgSpy).toHaveBeenCalledWith(baseCommit.commit);
    expect(gpgSpy).toHaveBeenCalledWith(headCommit.commit);
    expect(createStatusSpy).toHaveBeenCalledWith(githubMock, contextMock, headSha, true);
    expect(result).toBe(createStatusResult);
  });
});
