const assert = require('assert');
const sinon = require('sinon');
const generate = require('lodash.times');
const getCommits = require('../lib/get-commits');

const GitHubMock = require('./mocks/github');
const ContextMock = require('./mocks/context');

const createCommit = require('./utils/create-commit');
const createPayload = require('./utils/create-payload');

describe('get-commits', () => {
  it('should return all commits', async () => {
    // Arrange
    const commitEntries = generate(3, createCommit);
    const [headSha, baseSha] = [
      commitEntries[0].commit.sha,
      commitEntries[commitEntries.length - 1].commit.sha
    ];
    const contextMock = new ContextMock(createPayload(headSha, baseSha));

    const githubMock = new GitHubMock();

    sinon.stub(githubMock.repos, 'compareCommits').resolves({
      data: { commits: commitEntries }
    });

    // Act
    const actual = await getCommits(githubMock, contextMock);

    // Assert
    assert.deepStrictEqual(actual, commitEntries);
  });
});
