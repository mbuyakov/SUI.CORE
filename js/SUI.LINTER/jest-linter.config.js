let rootDir = process.cwd();

if (process.env.ROOT_DIR) {
  rootDir = rootDir + "/" + process.env.ROOT_DIR
}

module.exports = {
  rootDir,
  runner: 'jest-runner-eslint',
  displayName: 'lint',
  watchPlugins: ['jest-runner-eslint/watch-fix'],
  testMatch: ['<rootDir>/**/*.{js,ts,tsx}'],
};
