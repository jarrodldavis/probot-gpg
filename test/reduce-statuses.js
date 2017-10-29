/* eslint-env mocha */

const assert = require('assertive');

const reduceStatuses = require('../lib/reduce-statuses');

const ContextMock = require('./mocks/context').GpgEventContextMock;

const createPayload = require('./utils/create-payload');
const createSha = require('./utils/create-sha');

describe('reduce-statuses', () => {
  let contextMock;

  beforeEach(() => {
    contextMock = new ContextMock(createPayload(createSha(), createSha()));
  });

  it('should return "success" if all statuses are successful', () => {
    // Arrange
    const statusChain = ['success', 'success', 'success', 'success', 'success'];

    // Act
    const actual = reduceStatuses(contextMock, statusChain);

    // Assert
    assert.equal('success', actual);
  });

  it('should return "failure" if the first status is a failure', () => {
    // Arrange
    const statusChain = ['failure', 'success', 'success', 'success', 'success'];

    // Act
    const actual = reduceStatuses(contextMock, statusChain);

    // Assert
    assert.equal('failure', actual);
  });

  it('should return "failure" if the last status is a failure', () => {
    // Arrange
    const statusChain = ['success', 'success', 'success', 'success', 'failure'];

    // Act
    const actual = reduceStatuses(contextMock, statusChain);

    // Assert
    assert.equal('failure', actual);
  });

  it('should return "failure" if a middle status is a failure', () => {
    // Arrange
    const statusChain = ['success', 'success', 'failure', 'success', 'success'];

    // Act
    const actual = reduceStatuses(contextMock, statusChain);

    // Assert
    assert.equal('failure', actual);
  });

  it('should return "error" if the first status is an error', () => {
    // Arrange
    const statusChain = ['error', 'success', 'success', 'success', 'success'];

    // Act
    const actual = reduceStatuses(contextMock, statusChain);

    // Assert
    assert.equal('error', actual);
  });

  it('should return "error" if the last status is an error', () => {
    // Arrange
    const statusChain = ['success', 'success', 'success', 'success', 'error'];

    // Act
    const actual = reduceStatuses(contextMock, statusChain);

    // Assert
    assert.equal('error', actual);
  });

  it('should return "error" if a middle status is an error', () => {
    // Arrange
    const statusChain = ['success', 'success', 'error', 'success', 'success'];

    // Act
    const actual = reduceStatuses(contextMock, statusChain);

    // Assert
    assert.equal('error', actual);
  });

  it('should return "error" even if a subsequent status is a failure', () => {
    // Arrange
    const statusChain = ['success', 'success', 'error', 'success', 'failure'];

    // Act
    const actual = reduceStatuses(contextMock, statusChain);

    // Assert
    assert.equal('error', actual);
  });

  it('should return "error" even if a prior status is a failure', () => {
    // Arrange
    const statusChain = ['failure', 'success', 'error', 'success', 'success'];

    // Act
    const actual = reduceStatuses(contextMock, statusChain);

    // Assert
    assert.equal('error', actual);
  });
});
