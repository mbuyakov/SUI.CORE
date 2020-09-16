#! /usr/bin/env node
const mode = process.argv[2];

process.env.BROWSER = "none";
process.env.FORK_TS_CHECKER = "1";

switch (mode) {
  case "start-analyze":
    process.env.ANALYZE = "1";
  // noinspection FallThroughInSwitchStatementJS
  case "start":
    process.argv[2] = "dev";
    break;

  case "build-analyze":
    process.env.ANALYZE = "1";
  // noinspection FallThroughInSwitchStatementJS
  case "build":
    // Nothing
    break;
  default:
    throw new Error("Unknown command");
}

require("umi/lib/cli");

