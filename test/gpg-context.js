/* eslint-env mocha */

const assert = require('assertive')
const sinon = require('sinon')
const uuid = require('uuid/v4')

const GpgEventContext = require('../lib/gpg-context')

const ContextMock = require('./mocks/context').ProbotContextMock

const createPayload = require('./utils/create-payload')
const createSha = require('./utils/create-sha')
const createLogStubs = require('./utils/create-log-stubs')

describe('gpg-context', () => {
  it('should assign base context properties to itself', () => {
    // Arrange
    const context = new ContextMock(createPayload(createSha(), createSha(), {
      action: 'synchronize',
      repoName: 'jarrodldavis/probot-gpg-test',
      number: 1
    }), 'pull_request', uuid())

    // Act
    const gpgContext = new GpgEventContext(createLogStubs(), context)

    // Assert
    assert.equal(context.payload, gpgContext.payload)
    assert.equal(context.github, gpgContext.github)
  })

  it('should prefix log output', () => {
    // Arrange
    const payload = createPayload(createSha(), createSha(), {
      action: 'synchronize',
      repoName: 'jarrodldavis/probot-gpg-test',
      number: 1
    })

    const webhookId = uuid()
    const context = new ContextMock(payload, 'pull_request', webhookId)

    const log = createLogStubs()
    const childLog = createLogStubs()
    sinon.stub(log, 'child').returns(childLog)
    const gpgContext = new GpgEventContext(log, context)

    // Act
    gpgContext.log.debug('This is for debugging')
    gpgContext.log.info('Here is some information')
    gpgContext.log.error('An error occurred')

    // Assert
    sinon.assert.calledWith(log.child, {
      event: 'pull_request',
      action: 'synchronize',
      repo: 'jarrodldavis/probot-gpg-test',
      number: 1,
      webhook: webhookId
    })
    sinon.assert.calledWith(childLog.debug, 'This is for debugging')
    sinon.assert.calledWith(childLog.info, 'Here is some information')
    sinon.assert.calledWith(childLog.error, 'An error occurred')
  })
})
