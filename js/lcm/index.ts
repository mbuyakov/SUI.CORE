// LifeCycleManager
import {getCurPackage, packageHasEslintConfig} from "./utils";
import {runCommandForPackage, runGlobalCommand} from "./commandRunner";
const chalk = require(`${__dirname}/../node_modules/chalk`);

(async function main() {
  try {
    const command = process.argv.length === 2 ? process.env.npm_lifecycle_event : process.argv[2];

    const curPackage = getCurPackage();
    console.log(`Command: ${command}`);
    console.log(`Package: ${chalk.cyan(curPackage)}`);
    console.log(`Has EsLint config: ${curPackage == "GLOBAL" ? "not applicable" : packageHasEslintConfig(curPackage)}`);

    if (curPackage !== "GLOBAL") {
      await runCommandForPackage(command, curPackage, process.argv[3]);
    } else {
      await runGlobalCommand(command, process.argv[3]);
    }
    console.log("Done!");
  } catch (e) {
    console.error(e);
    console.error(chalk.red("Failed"));
    process.exit(1);
  }
})()
