module.exports = {
  cliOptions: {
    cache: true,
    quiet: true,
    fix: !!process.env.FIX,
    config: process.cwd() + "/.eslintrc.js"
  },
};
