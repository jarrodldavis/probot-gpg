const sinon = require('sinon');

module.exports = class RobotMock {
  constructor() {
    this.log =
      ['trace', 'debug', 'info', 'warn', 'error', 'fatal']
        .reduce((obj, level) => {
          obj[level] = sinon.stub();
          return obj;
        }, {});
  }

  on() {
    return this;
  }
};
