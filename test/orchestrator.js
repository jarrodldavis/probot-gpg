const expect = require('expect');
const proxyquire = require('proxyquire');

const ContextMock = require('./mocks/context');
const GitHubMock = require('./mocks/github');
const RobotMock = require('./mocks/robot');

const createCommitObject = require('./utils/create-commit');

function arrangeOrchestrator(gpg, createStatus) {
  return proxyquire('../lib/orchestrator', {
    './gpg': gpg,
    './create-status': createStatus
  });
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

    const event = {
      payload: {
        installation: { id: Math.ceil(Math.random() * 100) },
        pull_request: { // eslint-disable-line camelcase
          base: { sha: baseSha },
          head: { sha: headSha }
        }
      }
    };

    const githubMock = new GitHubMock();
    expect.spyOn(githubMock.repos, 'compareCommits')
          .andReturn({
            commits: [baseCommit, headCommit]
          });

    const robotMock = new RobotMock(githubMock);
    expect.spyOn(robotMock, 'auth').andCallThrough();

    const contextMock = new ContextMock();

    // Act
    const result = await orchestratorUnderTest(robotMock, event, contextMock);

    // Assert
    expect(robotMock.auth).toHaveBeenCalledWith(event.payload.installation.id);

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
