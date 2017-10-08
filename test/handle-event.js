const assert = require('assertive');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const ContextMock = require('./mocks/context');
const GitHubMock = require('./mocks/github');
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

describe('handle-event', () => {
  async function testScenario(commitStatuses, overallStatus) {
    // Arrange
    const commits = commitStatuses.map(status => createCommit(status).commit);

    const getCommitsSpy = sinon.stub().resolves(commits);

    const validateCommitSpy = sinon.stub();
    for (let i = 0; i <= commits.length; i += 1) {
      validateCommitSpy.withArgs(commits[i]).returns(commitStatuses[i]);
    }

    const reduceStatusesSpy = sinon.stub().returns(overallStatus);

    const createStatusResult = { state: overallStatus };
    const createStatusSpy = sinon.stub().resolves(createStatusResult);

    const handlerUnderTest = arrangeHandler(getCommitsSpy, validateCommitSpy, reduceStatusesSpy, createStatusSpy);

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
    sinon.assert.calledWith(getCommitsSpy, githubMock, contextMock);
    for (const commit of commits) {
      sinon.assert.calledWith(validateCommitSpy, commit);
    }
    sinon.assert.calledWithMatch(reduceStatusesSpy, sinon.match.array.deepEquals(commitStatuses));
    sinon.assert.calledWith(createStatusSpy, githubMock, contextMock, overallStatus);
    assert.equal(createStatusResult, result);
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

  it.skip('should orchestrate correctly when GPG verification check throws an error', async () => {
    const err = new Error('The verification status of the commit cannot be determined');
    const validateGpgSpy = sinon.stub().throws(err);
    await testScenario(validateGpgSpy, 'error');
  });
});
