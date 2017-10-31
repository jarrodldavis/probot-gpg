const events = require('events')

const GpgEventContext = require('./gpg-context')
const handleEvent = require('./handle-event')

module.exports = class Plugin extends events.EventEmitter {
  constructor () {
    super()
    this.robot = null
  }

  load (robot) {
    const prefix = '[GPG] {plugin.load}\n'
    if (!(this instanceof Plugin)) {
      robot.log.error(prefix + 'Unexpected execution context for method call')
      throw new TypeError('Unexpected execution context for method call')
    }

    if (this.robot !== null) {
      robot.log.error(prefix + 'Plugin instance has already been loaded')
      this.robot.log.error(prefix + 'Plugin instance has already been loaded')
      this.emit('error', new Error('Plugin instance has already been loaded'))
    }

    this.robot = robot
    this.robot.on(['pull_request.opened', 'pull_request.synchronize'], async context => this.acceptEvent(context))

    this.robot.log.debug(prefix + 'Registered webhook event handlers.')

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
      await handleEvent(new GpgEventContext(this.robot, context))
      this.emit('event-handled')
    } catch (err) {
      this.emit('error', err)
    }
  }
}
