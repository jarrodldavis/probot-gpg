const assert = require('assert');
const sinon = require('sinon');
const generate = require('lodash.times');
const getCommits = require('../lib/get-commits');

const GitHubMock = require('./mocks/github');
const ContextMock = require('./mocks/context');

const createCommit = require('./utils/create-commit');

describe('get-commits', () => {
  it('should return all commits', async () => {
    // Arrange
    const commitEntries = generate(3, createCommit);
    const contextMock = new ContextMock({
      pull_request: { // eslint-disable-line camelcase
        head: commitEntries[0],
        base: commitEntries[commitEntries.length - 1]
      }
    });

    const githubMock = new GitHubMock();

    sinon.stub(githubMock.repos, 'compareCommits').resolves({
      data: { commits: commitEntries }
    });

    const expected = commitEntries.map(entry => entry.commit);

    // Act
    const actual = await getCommits(githubMock, contextMock);

    // Assert
    assert.deepStrictEqual(actual, expected);
  });
});
