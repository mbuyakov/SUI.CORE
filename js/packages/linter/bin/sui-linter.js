#! /usr/bin/env node
process.argv.splice(2, 0, "--config", __dirname + "/../jest-linter.config.js", "--maxWorkers=4", "**/*.{js,ts,tsx}");

require("jest-cli/build/cli").run(process.argv, process.cwd());
