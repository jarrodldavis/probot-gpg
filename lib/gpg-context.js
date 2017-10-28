const Context = require('probot/lib/context');

module.exports = class GpgEventContext extends Context {
  constructor(robot, context) {
    super(context, context.github);

    const event = this.event.split('_').map(part => part[0]).join('_');
    const action = this.payload.action[0];
    const repo = this.payload.repository.full_name;
    const number = this.payload.number;
    const webhook = Buffer.from(this.id.replace(/-/g, ''), 'hex').toString('base64');
    const logPrefix = `[GPG] {${event}.${action}@${repo}#${number} ${webhook}}`;

    this.log = Object
      .entries(robot.log)
      .reduce((obj, [level, fn]) => {
        obj[level] = message => fn(`${logPrefix} ${message}`);
        return obj;
      }, {});
  }
};
