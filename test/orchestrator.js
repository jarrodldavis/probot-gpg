const expect = require('expect');
const proxyquire = require('proxyquire');

const ContextMock = require('./mocks/context');
const GitHubMock = require('./mocks/github');
const RobotMock = require('./mocks/robot');

const createSha = require('./utils/create-sha');
const createEvent = require('./utils/create-event');

function arrangeOrchestrator(gpg, createStatus) {
  return proxyquire('../lib/orchestrator', {
    './gpg': gpg,
    './create-status': createStatus
  });
}

describe('orchestrator', () => {
  async function testScenario(gpgSpy, allCommitsVerified, statusState) {
    // Arrange
    const createStatusResult = { state: statusState };
    const createStatusSpy = expect.createSpy().andReturn(Promise.resolve(createStatusResult));

    const orchestratorUnderTest = arrangeOrchestrator(gpgSpy, createStatusSpy);

    const githubMock = new GitHubMock();
    const robotMock = new RobotMock(githubMock);
    expect.spyOn(robotMock, 'auth').andCallThrough();

    const [baseSha, headSha] = [createSha(), createSha()];
    const event = createEvent(baseSha, headSha);

    const contextMock = new ContextMock();

    // Act
    const result = await orchestratorUnderTest(robotMock, event, contextMock);

    // Assert
    expect(robotMock.auth).toHaveBeenCalledWith(event.payload.installation.id);
    expect(gpgSpy).toHaveBeenCalledWith(githubMock, baseSha, headSha);
    expect(createStatusSpy).toHaveBeenCalledWith(githubMock, contextMock, headSha, allCommitsVerified);
    expect(result).toBe(createStatusResult);
  }

  it('should orchestrate correctly when all commits are verified', async () => {
    const gpgSpy = expect.createSpy().andReturn(true);
    await testScenario(gpgSpy, true, 'success');
  });

  it('should orchestrate correctly when all commits are not verified', async () => {
    const gpgSpy = expect.createSpy().andReturn(false);
    await testScenario(gpgSpy, false, 'failure');
  });

  it('should orchestrate correctly when gpg verification check fails', async () => {
    const err = new Error('The verification status of the commit cannot be determined');
    const gpgSpy = expect.createSpy().andThrow(err);
    await testScenario(gpgSpy, 'error', 'error');
  });
});
