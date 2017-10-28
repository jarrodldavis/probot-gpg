const Context = require('probot/lib/context');

module.exports = class GpgEventContext extends Context {
  constructor(robot, context) {
    super(context, context.github);

    const event = this.event;
    const action = this.payload.action;
    const repo = this.payload.repository.full_name;
    const number = this.payload.number;
    const logPrefix = `[GPG] {${event}.${action}@${repo}#${number}} (${this.id})`;

    this.log = Object
      .entries(robot.log)
      .reduce((obj, [level, fn]) => {
        obj[level] = message => fn(`${logPrefix}\n${message}`);
        return obj;
      }, {});
  }
};
