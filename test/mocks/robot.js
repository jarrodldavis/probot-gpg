const createLogStubs = require('../utils/create-log-stubs')

module.exports = class RobotMock {
  constructor () {
    this.log = createLogStubs()
  }

  on () {
    return this
  }
}
