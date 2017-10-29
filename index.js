const Plugin = require('./lib/plugin')

module.exports = robot => new Plugin().load(robot)
