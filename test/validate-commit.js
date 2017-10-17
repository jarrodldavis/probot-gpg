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

  describe('web-flow defaults', () => {
    it('should treat a successful web-flow commit normally', () => {
      // Arrange
      const commit = createCommit('success', 'web-flow').commit;

      // Act
      const actual = validateCommit(defaultConfig, commit);

      // Assert
      assert.equal('success', actual);
    });

    it('should treat a failed web-flow commit normally', () => {
      // Arrange
      const commit = createCommit('failed', 'web-flow').commit;

      // Act
      const actual = validateCommit(defaultConfig, commit);

      // Assert
      assert.equal('failure', actual);
    });

    it('should treat an errored web-flow commit normally', () => {
      // Arrange
      const commit = createCommit('error', 'web-flow').commit;

      // Act
      const actual = validateCommit(defaultConfig, commit);

      // Assert
      assert.equal('error', actual);
    });
  });

  describe('web-flow ignore', () => {
    const config = Object.assign({}, defaultConfig, { ignoreWebFlow: true });

    it('should treat a successful web-flow commit normally', () => {
      // Arrange
      const commit = createCommit('success', 'web-flow').commit;

      // Act
      const actual = validateCommit(config, commit);

      // Assert
      assert.equal('success', actual);
    });

    it('should return "web-flow-ignored" if a web-flow commit is not verified', () => {
      // Arrange
      const commit = createCommit('failure', 'web-flow').commit;

      // Act
      const actual = validateCommit(config, commit);

      // Assert
      assert.equal('web-flow-ignored', actual);
    });

    it('should return "web-flow-ignored" if a web-flow commit does not have verification information', () => {
      // Arrange
      const commit = createCommit('error', 'web-flow').commit;

      // Act
      const actual = validateCommit(config, commit);

      // Assert
      assert.equal('web-flow-ignored', actual);
    });
  });
});
