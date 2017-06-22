const events = require('events');

const handleEvent = require('./handle-event');

module.exports = class Plugin extends events.EventEmitter {
  constructor() {
    super();
    this.robot = null;
  }

  load(robot) {
    if (!(this instanceof Plugin)) {
      throw new TypeError('Unexpected execution context for method call');
    }

    if (this.robot !== null) {
      this.emit('error', new Error('Plugin instance has already been loaded'));
    }

    this.robot = robot;
    this.robot.on('pull_request', async context => this.acceptEvent(context));
  }

  async acceptEvent(context) {
    if (!(this instanceof Plugin)) {
      throw new TypeError('Unexpected execution context for method call');
    }

    if (this.robot === null) {
      this.emit('error', new Error('Cannot accept event before load'));
      return;
    }

    try {
      await handleEvent(this.robot, context);
      this.emit('event-handled');
    } catch (err) {
      this.emit('error', err);
    }
  }
};
