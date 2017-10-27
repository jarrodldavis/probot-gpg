const assert = require('assertive');
const validateCommit = require('../lib/validate-commit');

const ContextMock = require('./mocks/context').GpgEventContextMock;

const createCommit = require('./utils/create-commit');
const createPayload = require('./utils/create-payload');
const createSha = require('./utils/create-sha');

describe('validate-commit', () => {
  let contextMock;

  beforeEach(() => {
    contextMock = new ContextMock(createPayload(createSha(), createSha()));
  });

  it('should return "success" if commit is verified', () => {
    // Arrange
    const commit = createCommit('success').commit;

    // Act
    const actual = validateCommit(contextMock, commit);

    // Assert
    assert.equal('success', actual);
  });

  it('should return "failure" if commit is not verified', () => {
    // Arrange
    const commit = createCommit('failure').commit;

    // Act
    const actual = validateCommit(contextMock, commit);

    // Assert
    assert.equal('failure', actual);
  });

  it('should return "error" if commit has not verification information', () => {
    // Arrange
    const commit = createCommit('error').commit;

    // Act
    const actual = validateCommit(contextMock, commit);

    //
    assert.equal('error', actual);
  });
});
