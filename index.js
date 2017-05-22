const handleEvent = require('./lib/handle-event');

module.exports = robot => {
  robot.on('pull_request', (event, context) => handleEvent(robot, event, context));
};
