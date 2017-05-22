const expect = require('expect');
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
    contextMock: new ContextMock(),
    event: { action: 'test' }
  };
}

describe('plugin', () => {
  it('should load correctly', async () => {
    // Arrange
    const handleEventSpy = expect.createSpy();
    const { plugin, robotMock, contextMock, event } = arrange(handleEventSpy);

    // Act
    plugin.load(robotMock);
    await plugin.acceptEvent(event, contextMock);

    // Assert
    expect(handleEventSpy).toHaveBeenCalledWith(robotMock, event, contextMock);
  });

  it('should emit finished event when event is handled successfully');

  it('should emit error event when event handler fails');

  it('should throw if loaded more than once');

  it('should throw if events are given before loading');

  it('should throw if `load` is called with incorrect execution context');

  it('should throw if `acceptEvent` is called with incorrect execution context');
});
