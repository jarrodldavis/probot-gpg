const expect = require('expect');
const proxyquire = require('proxyquire');

const ContextMock = require('./mocks/context');
const GitHubMock = require('./mocks/github');
const RobotMock = require('./mocks/robot');

const createSha = require('./utils/create-sha');
const createEvent = require('./utils/create-event');

function arrangeHandler(validateGpg, createStatus) {
  return proxyquire('../lib/handle-event', {
    './validate-gpg': validateGpg,
    './create-status': createStatus
  });
}

describe('handle-event', () => {
  async function testScenario(validateGpgSpy, allCommitsVerified, statusState) {
    // Arrange
    const createStatusResult = { state: statusState };
    const createStatusSpy = expect.createSpy().andReturn(Promise.resolve(createStatusResult));

    const handlerUnderTest = arrangeHandler(validateGpgSpy, createStatusSpy);

    const githubMock = new GitHubMock();
    const robotMock = new RobotMock(githubMock);
    expect.spyOn(robotMock, 'auth').andCallThrough();

    const [baseSha, headSha] = [createSha(), createSha()];
    const event = createEvent(baseSha, headSha);

    const contextMock = new ContextMock();

    // Act
    const result = await handlerUnderTest(robotMock, event, contextMock);

    // Assert
    expect(robotMock.auth).toHaveBeenCalledWith(event.payload.installation.id);
    expect(validateGpgSpy).toHaveBeenCalledWith(githubMock, baseSha, headSha);
    expect(createStatusSpy).toHaveBeenCalledWith(githubMock, contextMock, headSha, allCommitsVerified);
    expect(result).toBe(createStatusResult);
  }

  it('should orchestrate correctly when all commits are verified', async () => {
    const validateGpgSpy = expect.createSpy().andReturn(true);
    await testScenario(validateGpgSpy, true, 'success');
  });

  it('should orchestrate correctly when all commits are not verified', async () => {
    const validateGpgSpy = expect.createSpy().andReturn(false);
    await testScenario(validateGpgSpy, false, 'failure');
  });

  it('should orchestrate correctly when GPG verification check fails', async () => {
    const err = new Error('The verification status of the commit cannot be determined');
    const validateGpgSpy = expect.createSpy().andThrow(err);
    await testScenario(validateGpgSpy, 'error', 'error');
  });
});
