const events = require('events');

const handleEvent = require('./handle-event');

module.exports = class Plugin extends events.EventEmitter {
  constructor() {
    super();
    this.robot = null;
  }

  load(robot) {
    this.robot = robot;
    this.robot.on('pull_request', this.acceptEvent.bind(this));
  }

  async acceptEvent(event, context) {
    if (this.robot === null) {
      this.emit('error', new Error('Cannot accept event before load'));
      return;
    }

    try {
      await handleEvent(this.robot, event, context);
      this.emit('finished');
    } catch (err) {
      this.emit('error', err);
    }
  }
};
