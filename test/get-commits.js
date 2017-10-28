const assert = require('assert');
const sinon = require('sinon');
const generate = require('lodash.times');
const getCommits = require('../lib/get-commits');

const ContextMock = require('./mocks/context').GpgEventContextMock;

const createCommit = require('./utils/create-commit');
const createPayload = require('./utils/create-payload');

describe('get-commits', () => {
  it('should return all commits', async () => {
    // Arrange
    const commitEntries = generate(3, createCommit);
    const [headSha, baseSha] = [
      commitEntries[0].sha,
      commitEntries[commitEntries.length - 1].sha
    ];
    const contextMock = new ContextMock(createPayload(headSha, baseSha));

    sinon.stub(contextMock.github.repos, 'compareCommits').resolves({
      data: { commits: commitEntries }
    });

    // Act
    const actual = await getCommits(contextMock);

    // Assert
    assert.deepStrictEqual(actual, commitEntries);
  });
});
