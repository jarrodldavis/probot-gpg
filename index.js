const handleEvent = require('./lib/handle-event');

module.exports = robot => {
  // Your plugin code here
  robot.on('pull_request', (event, context) => handleEvent(robot, event, context));

  // For more information on building plugins:
  // https://github.com/probot/probot/blob/master/docs/plugins.md

  // To get your plugin running against GitHub, see:
  // https://github.com/probot/probot/blob/master/docs/development.md
};
