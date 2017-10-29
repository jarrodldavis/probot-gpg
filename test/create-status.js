/* eslint-env mocha */

const sinon = require('sinon');

const createStatus = require('../lib/create-status');

const ContextMock = require('./mocks/context').GpgEventContextMock;

const createSha = require('./utils/create-sha');

function arrange() {
  const sha = createSha();
  const contextMock = new ContextMock({
    pull_request: { // eslint-disable-line camelcase
      head: {
        sha
      }
    }
  });
  return { contextMock, sha };
}

describe('create-status', () => {
  let sha;
  let contextMock;

  beforeEach(() => {
    ({ sha, contextMock } = arrange());
    sinon.spy(contextMock.github.repos, 'createStatus');
  });

  afterEach(() => {
    contextMock.github.repos.createStatus.restore();
  });

  it('should create a success state when `gpgStatus` is "success"', async () => {
    createStatus(contextMock, 'success');
    sinon.assert.calledWith(contextMock.github.repos.createStatus, {
      sha,
      context: 'GPG',
      state: 'success',
      description: 'All commits have a verified GPG signature',
      owner: 'owner',
      repo: 'repo'
    });
  });

  it('should create a failure state when `gpgStatus` is "failure"', async () => {
    createStatus(contextMock, 'failure');
    sinon.assert.calledWith(contextMock.github.repos.createStatus, {
      sha,
      context: 'GPG',
      state: 'failure',
      description: 'All commits must have a verified GPG signature',
      target_url: 'https://help.github.com/articles/about-gpg/', // eslint-disable-line camelcase
      owner: 'owner',
      repo: 'repo'
    });
  });

  it('should create an error state when `gpgStatus` is "error"', async () => {
    createStatus(contextMock, 'error');
    sinon.assert.calledWith(contextMock.github.repos.createStatus, {
      sha,
      context: 'GPG',
      state: 'error',
      description: 'An error occurred while checking the commit GPG status',
      owner: 'owner',
      repo: 'repo'
    });
  });

  it('should create an error state when `gpgStatus` is unexpected', async () => {
    createStatus(contextMock, 42);
    sinon.assert.calledWith(contextMock.github.repos.createStatus, {
      sha,
      context: 'GPG',
      state: 'error',
      description: 'An error occurred while checking the commit GPG status',
      owner: 'owner',
      repo: 'repo'
    });
  });
});
