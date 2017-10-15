const assert = require('assertive');
const validateCommit = require('../lib/validate-commit');

const defaultConfig = require('../lib/default-config.json');
const createCommit = require('./utils/create-commit');

describe('validate-commit', () => {
  it('should return "success" if commit is verified', () => {
    // Arrange
    const commit = createCommit('success').commit;

    // Act
    const actual = validateCommit(defaultConfig, commit);

    // Assert
    assert.equal('success', actual);
  });

  it('should return "failure" if commit is not verified', () => {
    // Arrange
    const commit = createCommit('failure').commit;

    // Act
    const actual = validateCommit(defaultConfig, commit);

    // Assert
    assert.equal('failure', actual);
  });

  it('should return "error" if commit has not verification information', () => {
    // Arrange
    const commit = createCommit('error').commit;

    // Act
    const actual = validateCommit(defaultConfig, commit);

    //
    assert.equal('error', actual);
  });
});
