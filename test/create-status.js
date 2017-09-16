const sinon = require('sinon');

const createStatus = require('../lib/create-status');

const ContextMock = require('./mocks/context');
const GitHubMock = require('./mocks/github');

const createSha = require('./utils/create-sha');

const contextMock = new ContextMock();
const githubMock = new GitHubMock();

describe('create-status', () => {
  beforeEach(() => {
    sinon.spy(githubMock.repos, 'createStatus');
  });

  afterEach(() => {
    githubMock.repos.createStatus.restore();
  });

  it('should create a success state when `gpgStatus` is `true`', () => {
    const sha = createSha();
    createStatus(githubMock, contextMock, sha, true);
    sinon.assert.calledWith(githubMock.repos.createStatus, {
      sha,
      context: 'GPG',
      state: 'success',
      description: 'All commits have a verified GPG signature',
      owner: 'owner',
      repo: 'repo'
    });
  });

  it('should create a failure state when `gpgStatus` is `false`', () => {
    const sha = createSha();
    createStatus(githubMock, contextMock, sha, false);
    sinon.assert.calledWith(githubMock.repos.createStatus, {
      sha,
      context: 'GPG',
      state: 'failure',
      description: 'All commits must have a verified GPG signature',
      target_url: 'https://help.github.com/articles/about-gpg/', // eslint-disable-line camelcase
      owner: 'owner',
      repo: 'repo'
    });
  });

  it('should create an error state when `gpgStatus` is not a boolean', () => {
    const sha = createSha();
    createStatus(githubMock, contextMock, sha, 'error');
    sinon.assert.calledWith(githubMock.repos.createStatus, {
      sha,
      context: 'GPG',
      state: 'error',
      description: 'An error occurred while checking the commit GPG status',
      owner: 'owner',
      repo: 'repo'
    });
  });
});
