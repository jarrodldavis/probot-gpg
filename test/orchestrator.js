const expect = require('expect');
const proxyquire = require('proxyquire');
const contextMock = require('./mocks/context');
const createSha = require('./utils/create-sha');

const githubMock = {
  repos: {
    compareCommits: () => Promise.resolve()
  }
};

function arrangeOrchestrator(gpg, createStatus) {
  return proxyquire('../lib/orchestrator', {
    './gpg': gpg,
    './create-status': createStatus
  });
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
  async function testOrchestratorWithCommitsVerifiedStatus(allCommitsVerified) {
    // Arrange
    const gpgSpy = expect.createSpy().andReturn(allCommitsVerified);
    const createStatusResult = { state: allCommitsVerified ? 'success' : 'failure' };
    const createStatusSpy = expect.createSpy().andReturn(Promise.resolve(createStatusResult));
    const orchestratorUnderTest = arrangeOrchestrator(gpgSpy, createStatusSpy);

    const baseCommit = createCommitObject(allCommitsVerified);
    const baseSha = baseCommit.sha;
    const headCommit = createCommitObject(allCommitsVerified);
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
    if (allCommitsVerified) {
      expect(gpgSpy).toHaveBeenCalledWith(headCommit.commit);
    }
    expect(createStatusSpy).toHaveBeenCalledWith(githubMock, contextMock, headSha, allCommitsVerified);
    expect(result).toBe(createStatusResult);
  }

  it('should orchestrate correctly when all commits are verified', async () => {
    await testOrchestratorWithCommitsVerifiedStatus(true);
  });

  it('should orchestrate correctly when all commits are not verified', async () => {
    await testOrchestratorWithCommitsVerifiedStatus(false);
  });

  it('should orchestrate correctly when some, but not all, commits are not verified');

  it('should orchestrate correctly when gpg verification check fails');
});
