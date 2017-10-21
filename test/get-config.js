const assert = require('assertive');

const getConfig = require('../lib/get-config');

const ContextMock = require('./mocks/context');

describe('get-config', () => {
  it('should get the config', async () => {
    // Arrange
    const expected = { ignoreWebFlow: true };
    const contextMock = new ContextMock(null, { gpg: expected });

    // Act
    const actual = await getConfig(contextMock);

    // Assert
    assert.deepEqual(expected, actual);
  });

  it('should return the default config if no GPG options are defined', async () => {
    // Arrange
    const expected = { ignoreWebFlow: false };
    const contextMock = new ContextMock(null, {});

    // Act
    const actual = await getConfig(contextMock);

    // Assert
    assert.deepEqual(expected, actual);
  });

  it('should return the default config if other GPG options are defined', async () => {
    // Arrange
    const expected = { unused: 5, ignoreWebFlow: false };
    const contextMock = new ContextMock(null, { gpg: { unused: 5 } });

    // Act
    const actual = await getConfig(contextMock);

    // Assert
    assert.deepEqual(expected, actual);
  });
});
