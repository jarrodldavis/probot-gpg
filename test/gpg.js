const expect = require('expect');
const gpg = require('../lib/gpg');

describe('gpg', () => {
  it('should return true if the commit has a verified GPG signature', () => {
    const commit = {
      verification: {
        verified: true,
        reason: 'valid'
      }
    };

    expect(gpg(commit)).toBe(true);
  });

  it('should return false if the commit has an invalid GPG signature', () => {
    const commit = {
      verification: {
        verified: false,
        reason: 'bad_email'
      }
    };

    expect(gpg(commit)).toBe(false);
  });

  it('should throw if the commit does not have GPG signature information', () => {
    const commit = {

    };

    expect(() => {
      gpg(commit);
    }).toThrow();
  });
});
