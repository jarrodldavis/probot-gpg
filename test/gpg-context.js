/* eslint-env mocha */

const assert = require('assertive');
const sinon = require('sinon');
const uuid = require('uuid/v4');

const GpgEventContext = require('../lib/gpg-context');

const RobotMock = require('./mocks/robot');
const ContextMock = require('./mocks/context').ProbotContextMock;

const createPayload = require('./utils/create-payload');
const createSha = require('./utils/create-sha');

describe('gpg-context', () => {
  it('should assign base context properties to itself', () => {
    // Arrange
    const robot = new RobotMock();
    const context = new ContextMock(createPayload(createSha(), createSha(), {
      action: 'synchronize',
      repoName: 'jarrodldavis/probot-gpg-test',
      number: 1
    }), 'pull_request', uuid());

    // Act
    const gpgContext = new GpgEventContext(robot, context);

    // Assert
    assert.equal(context.payload, gpgContext.payload);
    assert.equal(context.github, gpgContext.github);
  });

  it('should prefix log output', () => {
    // Arrange
    const robot = new RobotMock();

    const payload = createPayload(createSha(), createSha(), {
      action: 'synchronize',
      repoName: 'jarrodldavis/probot-gpg-test',
      number: 1
    });

    const webhookId = uuid();
    const context = new ContextMock(payload, 'pull_request', webhookId);

    const expectedPrefix = `[GPG] {pull_request.synchronize@jarrodldavis/probot-gpg-test#1} (${webhookId})`;

    const gpgContext = new GpgEventContext(robot, context);

    // Act
    gpgContext.log.debug('This is for debugging');
    gpgContext.log.info('Here is some information');
    gpgContext.log.error('An error occurred');

    // Assert
    sinon.assert.calledWith(robot.log.debug, `${expectedPrefix}\nThis is for debugging`);
    sinon.assert.calledWith(robot.log.info, `${expectedPrefix}\nHere is some information`);
    sinon.assert.calledWith(robot.log.error, `${expectedPrefix}\nAn error occurred`);
  });
});
