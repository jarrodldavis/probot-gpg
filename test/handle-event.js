const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const ContextMock = require('./mocks/context');
const GitHubMock = require('./mocks/github');
const RobotMock = require('./mocks/robot');

const createSha = require('./utils/create-sha');
const createPayload = require('./utils/create-payload');

function arrangeHandler(validateGpg, createStatus) {
  return proxyquire('../lib/handle-event', {
    './validate-gpg': validateGpg,
    './create-status': createStatus
  });
}

describe('handle-event', () => {
  async function testScenario(validateGpgSpy, status) {
    // Arrange
    const createStatusResult = { state: status };
    const createStatusSpy = sinon.stub().resolves(createStatusResult);

    const handlerUnderTest = arrangeHandler(validateGpgSpy, createStatusSpy);

    const githubMock = new GitHubMock();
    const robotMock = new RobotMock(githubMock);
    sinon.spy(robotMock, 'auth');

    const [baseSha, headSha] = [createSha(), createSha()];
    const payload = createPayload(baseSha, headSha);

    const contextMock = new ContextMock(payload);

    // Act
    const result = await handlerUnderTest(robotMock, contextMock);

    // Assert
    sinon.assert.calledWith(robotMock.auth, payload.installation.id);
    sinon.assert.calledWith(validateGpgSpy, githubMock, contextMock, baseSha, headSha);
    sinon.assert.calledWith(createStatusSpy, githubMock, contextMock, status);
    assert.equal(result, createStatusResult);
  }

  it('should orchestrate correctly when all commits are verified', async () => {
    const validateGpgSpy = sinon.stub().returns('success');
    await testScenario(validateGpgSpy, 'success');
  });

  it('should orchestrate correctly when all commits are not verified', async () => {
    const validateGpgSpy = sinon.stub().returns('failure');
    await testScenario(validateGpgSpy, 'failure');
  });

  it('should orchestrate correctly when GPG verification check returns an error', async () => {
    const validateGpgSpy = sinon.stub().returns('error');
    await testScenario(validateGpgSpy, 'error');
  });

  it('should orchestrate correctly when GPG verification check throws an error', async () => {
    const err = new Error('The verification status of the commit cannot be determined');
    const validateGpgSpy = sinon.stub().throws(err);
    await testScenario(validateGpgSpy, 'error');
  });
});
