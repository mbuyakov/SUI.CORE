#! /usr/bin/env node
process.argv.splice(2, 0, "--config", "./node_modules/@sui/linter/jest-linter.config.js", "--maxWorkers=4", "**/*.{js,ts,tsx}");

// process.env.TIMING = "1";

require("jest-cli/build/cli").run(process.argv, process.cwd());
