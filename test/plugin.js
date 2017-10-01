const assert = require('assertive');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const ContextMock = require('./mocks/context');
const GitHubMock = require('./mocks/github');
const RobotMock = require('./mocks/robot');

function arrange(handleEventSpy) {
  const Plugin = proxyquire('../lib/plugin', {
    './handle-event': handleEventSpy
  });
  return {
    plugin: new Plugin(),
    robotMock: new RobotMock(new GitHubMock()),
    contextMock: new ContextMock()
  };
}

describe('plugin', () => {
  it('should load correctly', async () => {
    // Arrange
    const handleEventSpy = sinon.spy();
    const { plugin, robotMock, contextMock } = arrange(handleEventSpy);

    // Act
    plugin.load(robotMock);
    await plugin.acceptEvent(contextMock);

    // Assert
    sinon.assert.calledWith(handleEventSpy, robotMock, contextMock);
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
    assert.throws(() => plugin.load.call(undefined, robotMock));
  });

  it('should throw if `acceptEvent` is called with incorrect execution context', async () => {
    // Arrange
    const { plugin, robotMock, contextMock } = arrange(sinon.stub());

    plugin.on('error', sinon.stub());

    plugin.load(robotMock);

    // Act, Assert
    try {
      await plugin.acceptEvent.call(contextMock);
    } catch (err) {
      assert.equal(err.message, 'Unexpected execution context for method call');
      return;
    }

    throw new Error('Expected `acceptEvent` to throw');
  });
});
