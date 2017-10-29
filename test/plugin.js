/* eslint-env mocha */

const assert = require('assertive');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

const ContextMock = require('./mocks/context').ProbotContextMock;
const GpgEventContextMock = require('./mocks/context').GpgEventContextMock;
const RobotMock = require('./mocks/robot');

const createPayload = require('./utils/create-payload');
const createSha = require('./utils/create-sha');

function arrange(handleEventSpy) {
  const payload = createPayload(createSha(), createSha());
  const contextMock = new ContextMock(payload);
  const gpgContextMock = new GpgEventContextMock(payload);
  const gpgContextConstructorMock = sinon.spy(() => gpgContextMock);

  const Plugin = proxyquire('../lib/plugin', {
    './handle-event': handleEventSpy,
    './gpg-context': gpgContextConstructorMock
  });
  return {
    plugin: new Plugin(),
    robotMock: new RobotMock(),
    contextMock,
    gpgContextMock,
    gpgContextConstructorMock
  };
}

describe('plugin', () => {
  it('should load correctly', async () => {
    // Arrange
    const handleEventSpy = sinon.spy();
    const { plugin, robotMock, contextMock, gpgContextMock, gpgContextConstructorMock } = arrange(handleEventSpy);

    // Act
    plugin.load(robotMock);
    await plugin.acceptEvent(contextMock);

    // Assert
    sinon.assert.calledWith(gpgContextConstructorMock, robotMock, contextMock);
    sinon.assert.calledWith(handleEventSpy, gpgContextMock);
  });

  it('should emit event-handled event when event is handled successfully', async () => {
    // Arrange
    const { plugin, robotMock, contextMock } = arrange(sinon.stub());

    plugin.load(robotMock);

    const finishedEventSpy = sinon.spy();
    plugin.on('event-handled', finishedEventSpy);

    // Act
    await plugin.acceptEvent(contextMock);

    // Assert
    sinon.assert.calledOnce(finishedEventSpy);
  });

  it('should emit error event when event handler fails', async () => {
    // Arrange
    const { plugin, robotMock, contextMock } = arrange(sinon.stub().throws());

    plugin.load(robotMock);

    const errorEventSpy = sinon.spy();
    plugin.on('error', errorEventSpy);

    // Act
    await plugin.acceptEvent(contextMock);

    // Assert
    sinon.assert.calledOnce(errorEventSpy);
  });

  it('should emit error event if loaded more than once', () => {
    // Arrange
    const { plugin, robotMock } = arrange(sinon.stub());

    const errorEventSpy = sinon.spy();
    plugin.on('error', errorEventSpy);

    // Act
    plugin.load(robotMock);
    plugin.load(robotMock);

    // Assert
    sinon.assert.calledOnce(errorEventSpy);
  });

  it('should emmit error event if events are given before loading', async () => {
    // Arrange
    const { plugin, contextMock } = arrange(sinon.stub());

    const errorEventSpy = sinon.spy();
    plugin.on('error', errorEventSpy);

    // Act
    await plugin.acceptEvent(contextMock);

    // Assert
    sinon.assert.calledOnce(errorEventSpy);
  });

  it('should throw if `load` is called with incorrect execution context', () => {
    // Arrange
    const { plugin, robotMock } = arrange(sinon.stub());

    // Act, Assert
    const err = assert.throws(() => plugin.load.call(undefined, robotMock));
    assert.equal('Unexpected execution context for method call', err.message);
  });

  it('should throw if `acceptEvent` is called with incorrect execution context', async () => {
    // Arrange
    const { plugin, robotMock, contextMock } = arrange(sinon.stub());

    plugin.on('error', sinon.stub());

    plugin.load(robotMock);

    // Act, Assert
    const err = await assert.rejects(plugin.acceptEvent.call(undefined, contextMock));
    assert.equal('Unexpected execution context for method call', err.message);
  });
});
