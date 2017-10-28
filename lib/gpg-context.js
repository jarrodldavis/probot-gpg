const Context = require('probot/lib/context');

module.exports = class GpgEventContext extends Context {
  constructor(robot, context) {
    super(context, context.github);

    const prefixes = [];
    prefixes.push(['App', 'GPG']);
    prefixes.push(['Event', `${this.event}.${this.payload.action}`]);
    prefixes.push(['Repo', this.payload.repository.full_name]);
    prefixes.push(['Issue', this.payload.number]);
    prefixes.push(['Webhook', this.id]);

    const logPrefix = prefixes
      .map(([prefixName, prefixValue]) => `[${prefixName}: ${prefixValue}]`)
      .join(' ');

    this.log = Object
      .entries(robot.log)
      .reduce((obj, [level, fn]) => {
        obj[level] = message => fn(`${logPrefix} ${message}`);
        return obj;
      }, {});
  }
};
