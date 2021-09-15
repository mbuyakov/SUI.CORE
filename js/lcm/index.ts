// LifeCycleManager
import {getCurPackage} from "./utils";
import {runCommandForPackage, runGlobalCommand} from "./commandRunner";
const chalk = require(`${__dirname}/../node_modules/chalk`);

(async function main() {
  try {
    const command = process.argv.length === 2 ? process.env.npm_lifecycle_event : process.argv[2];

    const curPackage = getCurPackage();
    console.log(`Command: ${command}`);
    console.log(`Package: ${chalk.cyan(curPackage)}`);

    if (curPackage !== "GLOBAL") {
      await runCommandForPackage(command as any, curPackage, process.argv[3]);
    } else {
      await runGlobalCommand(command as any, process.argv[3]);
    }
    console.log("Done!");
  } catch (e) {
    console.error(e);
    console.error(chalk.red("Failed"));
    process.exit(1);
  }
})()
