const sinon = require('sinon');

module.exports = () =>
  ['trace', 'debug', 'info', 'warn', 'error', 'fatal']
    .reduce((obj, level) => {
      obj[level] = sinon.stub();
      return obj;
    }, {});
