const defaultConfig = {
  ignoreWebFlow: false
};

module.exports = async context => {
  const repoConfig = await context.config('config.yml', { gpg: defaultConfig });
  return repoConfig.gpg;
};
