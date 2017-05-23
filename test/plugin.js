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

  it('should emit event-handled event when event is handled successfully', async () => {
    // Arrange
    const { plugin, robotMock, contextMock, event } = arrange(expect.createSpy());

    plugin.load(robotMock);

    const finishedEventSpy = expect.createSpy();
    plugin.on('event-handled', finishedEventSpy);

    // Act
    await plugin.acceptEvent(event, contextMock);

    // Assert
    expect(finishedEventSpy).toHaveBeenCalled();
  });

  it('should emit error event when event handler fails', async () => {
    // Arrange
    const handleEventSpy = expect.createSpy().andThrow(new Error('Something happened'));
    const { plugin, robotMock, contextMock, event } = arrange(handleEventSpy);

    plugin.load(robotMock);

    const errorEventSpy = expect.createSpy();
    plugin.on('error', errorEventSpy);

    // Act
    await plugin.acceptEvent(event, contextMock);

    // Assert
    expect(errorEventSpy).toHaveBeenCalled();
  });

  it('should throw if loaded more than once', () => {
    // Arrange
    const { plugin, robotMock } = arrange(expect.createSpy());

    const errorEventSpy = expect.createSpy();
    plugin.on('error', errorEventSpy);

    // Act
    plugin.load(robotMock);
    plugin.load(robotMock);

    // Assert
    expect(errorEventSpy).toHaveBeenCalled();
  });

  it('should throw if events are given before loading', async () => {
    // Arrange
    const { plugin, contextMock, event } = arrange(expect.createSpy());

    const errorEventSpy = expect.createSpy();
    plugin.on('error', errorEventSpy);

    // Act
    await plugin.acceptEvent(event, contextMock);

    // Assert
    expect(errorEventSpy).toHaveBeenCalled();
  });

  it('should throw if `load` is called with incorrect execution context', () => {
    // Arrange
    const { plugin, robotMock } = arrange(expect.createSpy());

    const errorEventSpy = expect.createSpy();
    plugin.on('error', errorEventSpy);

    // Act, Assert
    expect(() => plugin.load.call(undefined, robotMock))
      .toThrow('Unexpected execution context for method call');
  });

  it('should throw if `acceptEvent` is called with incorrect execution context');
});
