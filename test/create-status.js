const expect = require('expect');

const createStatus = require('../lib/create-status');

const ContextMock = require('./mocks/context');
const GitHubMock = require('./mocks/github');

const createSha = require('./utils/create-sha');

const contextMock = new ContextMock();
const githubMock = new GitHubMock();

describe('create-status', () => {
  beforeEach(() => {
    expect.spyOn(githubMock.repos, 'createStatus');
  });

  afterEach(() => {
    expect.restoreSpies();
  });

  it('should create a success status when `gpgStatus` is `true`', () => {
    const sha = createSha();
    createStatus(githubMock, contextMock, sha, true);
    expect(githubMock.repos.createStatus).toHaveBeenCalledWith({
      sha,
      context: 'GPG',
      status: 'success',
      description: 'All commits have a verified GPG signature',
      owner: 'owner',
      repo: 'repo'
    });
  });

  it('should create a failure status when `gpgStatus` is `false`', () => {
    const sha = createSha();
    createStatus(githubMock, contextMock, sha, false);
    expect(githubMock.repos.createStatus).toHaveBeenCalledWith({
      sha,
      context: 'GPG',
      status: 'failure',
      description: 'All commits must have a verified GPG signature',
      target_url: 'https://help.github.com/articles/about-gpg/', // eslint-disable-line camelcase
      owner: 'owner',
      repo: 'repo'
    });
  });

  it('should create a error status when `gpgStatus` is not a boolean', () => {
    const sha = createSha();
    createStatus(githubMock, contextMock, sha, 'error');
    expect(githubMock.repos.createStatus).toHaveBeenCalledWith({
      sha,
      context: 'GPG',
      status: 'error',
      description: 'An error occurred while checking the commit GPG status',
      owner: 'owner',
      repo: 'repo'
    });
  });
});
