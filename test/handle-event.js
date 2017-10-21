const sinon = require('sinon');
const proxyquire = require('proxyquire');

const ContextMock = require('./mocks/context');
const RobotMock = require('./mocks/robot');

const createSha = require('./utils/create-sha');
const createCommit = require('./utils/create-commit');
const createPayload = require('./utils/create-payload');

function arrangeHandler(getCommits, validateCommit, reduceStatuses, createStatus) {
  return proxyquire('../lib/handle-event', {
    './get-commits': getCommits,
    './validate-commit': validateCommit,
    './reduce-statuses': reduceStatuses,
    './create-status': createStatus
  });
}

function arrangeSpies(commitStatuses, overallStatus) {
  const commits = commitStatuses.map(status => createCommit(status).commit);

  const getCommitsSpy = sinon.stub().resolves(commits);

  const validateCommitSpy = sinon.stub();
  for (let i = 0; i <= commits.length; i += 1) {
    validateCommitSpy.withArgs(commits[i]).returns(commitStatuses[i]);
  }

  const reduceStatusesSpy = sinon.stub().returns(overallStatus);

  const createStatusResult = { state: overallStatus };
  const createStatusSpy = sinon.stub().resolves(createStatusResult);

  return { commits, getCommitsSpy, validateCommitSpy, reduceStatusesSpy, createStatusSpy };
}

function arrangeMocks() {
  const robotMock = new RobotMock();

  const [baseSha, headSha] = [createSha(), createSha()];
  const payload = createPayload(baseSha, headSha);

  const contextMock = new ContextMock(payload);

  return { robotMock, contextMock };
}

describe('handle-event', () => {
  async function testScenario(commitStatuses, overallStatus) {
    // Arrange
    const { commits, getCommitsSpy, validateCommitSpy, reduceStatusesSpy, createStatusSpy } = arrangeSpies(commitStatuses, overallStatus);
    const handlerUnderTest = arrangeHandler(getCommitsSpy, validateCommitSpy, reduceStatusesSpy, createStatusSpy);
    const { robotMock, contextMock } = arrangeMocks();

    // Act
    await handlerUnderTest(robotMock, contextMock);

    // Assert
    sinon.assert.calledWith(getCommitsSpy, contextMock);
    for (const commit of commits) {
      sinon.assert.calledWith(validateCommitSpy, commit);
    }
    sinon.assert.calledWithMatch(reduceStatusesSpy, sinon.match.array.deepEquals(commitStatuses));
    sinon.assert.calledWith(createStatusSpy, contextMock, overallStatus);
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
    const getCommitsSpy = sinon.stub().throws();
    const { validateCommitSpy, reduceStatusesSpy, createStatusSpy } = arrangeSpies(['success', 'success', 'success'], 'success');
    const handlerUnderTest = arrangeHandler(getCommitsSpy, validateCommitSpy, reduceStatusesSpy, createStatusSpy);
    const { robotMock, contextMock } = arrangeMocks();

    // Act
    await handlerUnderTest(robotMock, contextMock);

    // Assert
    sinon.assert.calledWith(getCommitsSpy, contextMock);
    sinon.assert.notCalled(validateCommitSpy);
    sinon.assert.notCalled(reduceStatusesSpy);
    sinon.assert.calledWith(createStatusSpy, contextMock, 'error');
  });
});
