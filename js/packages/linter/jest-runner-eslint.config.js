module.exports = {
  cliOptions: {
    cache: true,
    quiet: true,
    fix: !!process.env.FIX,
    config: "node_modules/@sui/linter/.eslintrc.js"
  },
};
