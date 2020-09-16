module.exports = {
  cliOptions: {
    cache: true,
    quiet: true,
    fix: !!process.env.FIX,
    config: __dirname + "/.eslintrc.js"
  },
};
