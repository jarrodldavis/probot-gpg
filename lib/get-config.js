const defaultConfig = require('./default-config.json');

module.exports = async context => {
  const repoConfig = await context.config('config.yml', { gpg: {} });
  return Object.assign({}, defaultConfig, repoConfig.gpg);
};