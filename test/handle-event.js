const sinon = require('sinon');
const proxyquire = require('proxyquire');

const defaultConfig = require('../lib/default-config.json');

const ContextMock = require('./mocks/context');
const GitHubMock = require('./mocks/github');
const RobotMock = require('./mocks/robot');

const createSha = require('./utils/create-sha');
const createCommit = require('./utils/create-commit');
const createPayload = require('./utils/create-payload');

function arrangeHandler(getConfig, getCommits, validateCommit, reduceStatuses, createStatus) {
  return proxyquire('../lib/handle-event', {
    './get-config': getConfig,
    './get-commits': getCommits,
    './validate-commit': validateCommit,
    './reduce-statuses': reduceStatuses,
    './create-status': createStatus
  });
}

function arrangeSpies(commitStatuses, overallStatus) {
  const commits = commitStatuses.map(status => createCommit(status));

  const getConfigSpy = sinon.stub().resolves(defaultConfig);
  const getCommitsSpy = sinon.stub().resolves(commits);

  const validateCommitSpy = sinon.stub();
  for (let i = 0; i <= commits.length; i += 1) {
    validateCommitSpy.withArgs(defaultConfig, commits[i]).returns(commitStatuses[i]);
  }

  const reduceStatusesSpy = sinon.stub().returns(overallStatus);

  const createStatusResult = { state: overallStatus };
  const createStatusSpy = sinon.stub().resolves(createStatusResult);

  return { commits, getConfigSpy, getCommitsSpy, validateCommitSpy, reduceStatusesSpy, createStatusSpy };
}

function arrangeMocks() {
  const githubMock = new GitHubMock();
  const robotMock = new RobotMock(githubMock);
  sinon.spy(robotMock, 'auth');

  const [baseSha, headSha] = [createSha(), createSha()];
  const payload = createPayload(baseSha, headSha);

  const contextMock = new ContextMock(payload);

  return { installationId: payload.installation.id, githubMock, robotMock, contextMock };
}

describe('handle-event', () => {
  async function testScenario(commitStatuses, overallStatus) {
    // Arrange
    const { commits, getConfigSpy, getCommitsSpy, validateCommitSpy, reduceStatusesSpy, createStatusSpy } = arrangeSpies(commitStatuses, overallStatus);
    const handlerUnderTest = arrangeHandler(getConfigSpy, getCommitsSpy, validateCommitSpy, reduceStatusesSpy, createStatusSpy);
    const { installationId, githubMock, robotMock, contextMock } = arrangeMocks();

    // Act
    await handlerUnderTest(robotMock, contextMock);

    // Assert
    sinon.assert.calledWith(robotMock.auth, installationId);
    sinon.assert.calledWith(getConfigSpy, contextMock);
    sinon.assert.calledWith(getCommitsSpy, githubMock, contextMock);
    for (const commit of commits) {
      sinon.assert.calledWithMatch(validateCommitSpy, sinon.match(defaultConfig), sinon.match(commit));
    }
    sinon.assert.calledWithMatch(reduceStatusesSpy, sinon.match.array.deepEquals(commitStatuses));
    sinon.assert.calledWith(createStatusSpy, githubMock, contextMock, overallStatus);
  }

  it('should orchestrate correctly when all commits are verified', async () => {
    await testScenario(['success', 'success', 'success'], 'success');
  });

  it('should orchestrate correctly when all commits are not verified', async () => {
    await testScenario(['failure', 'failure', 'failure'], 'failure');
  });

  it('should orchestrate correctly when GPG verification check returns an error', async () => {
    await testScenario(['success', 'error', 'success'], 'error');
  });

  it('should orchestrate correctly when commit retrieval throws an error', async () => {
    // Arrange
    const getCommitsSpy = sinon.stub().rejects();
    const { getConfigSpy, validateCommitSpy, reduceStatusesSpy, createStatusSpy } = arrangeSpies(['success', 'success', 'success'], 'success');
    const handlerUnderTest = arrangeHandler(getConfigSpy, getCommitsSpy, validateCommitSpy, reduceStatusesSpy, createStatusSpy);
    const { installationId, githubMock, robotMock, contextMock } = arrangeMocks();

    // Act
    await handlerUnderTest(robotMock, contextMock);

    // Assert
    sinon.assert.calledWith(robotMock.auth, installationId);
    sinon.assert.calledWith(getConfigSpy, contextMock);
    sinon.assert.calledWith(getCommitsSpy, githubMock, contextMock);
    sinon.assert.notCalled(validateCommitSpy);
    sinon.assert.notCalled(reduceStatusesSpy);
    sinon.assert.calledWith(createStatusSpy, githubMock, contextMock, 'error');
  });
});
