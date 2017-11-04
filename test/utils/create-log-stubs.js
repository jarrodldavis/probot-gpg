const sinon = require('sinon')

module.exports = () => {
  let log = {}
  log.child = () => log

  return ['trace', 'debug', 'info', 'warn', 'error', 'fatal']
    .reduce((obj, level) => {
      obj[level] = sinon.stub()
      return obj
    }, log)
}
