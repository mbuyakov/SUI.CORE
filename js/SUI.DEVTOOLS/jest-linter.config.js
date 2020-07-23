let rootDir = process.cwd();

if (process.env.ROOT_DIR) {
  rootDir = rootDir + "/" + process.env.ROOT_DIR
}

module.exports = {
  rootDir,
  runner: require.resolve("jest-runner-eslint"),
  displayName: 'lint',
  watchPlugins: [require.resolve("jest-runner-eslint/watch-fix")],
  testMatch: ['<rootDir>/**/*.{js,ts,tsx}'],
};
