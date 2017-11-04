const events = require('events')
const bunyan = require('bunyan')

const GpgEventContext = require('./gpg-context')
const handleEvent = require('./handle-event')

module.exports = class Plugin extends events.EventEmitter {
  constructor () {
    super()
    this.log = bunyan.createLogger({
      name: 'GPG',
      level: process.env.LOG_LEVEL || 'debug',
      serializers: bunyan.stdSerializers
    })
    this.robot = null
  }

  load (robot) {
    if (!(this instanceof Plugin)) {
      throw new TypeError('Unexpected execution context for method call')
    }

    if (this.robot !== null) {
      this.emit('error', new Error('Plugin instance has already been loaded'))
    }

    this.robot = robot
    this.robot.on(['pull_request.opened', 'pull_request.synchronize'], async context => this.acceptEvent(context))

    this.log.debug('Registered webhook event handlers.')

    this.emit('loaded')
  }

  async acceptEvent (context) {
    if (!(this instanceof Plugin)) {
      throw new TypeError('Unexpected execution context for method call')
    }

    if (this.robot === null) {
      this.emit('error', new Error('Cannot accept event before load'))
      return
    }

    try {
      await handleEvent(new GpgEventContext(this.log, context))
      this.emit('event-handled')
    } catch (err) {
      this.emit('error', err)
    }
  }
}
