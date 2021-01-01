import {runCommandForPackage} from "../../commandRunner";
import {getAllPackages} from "../../utils";

const chalk = require(`${__dirname}/../../../node_modules/chalk`);

export async function globalPublish(version: string): Promise<void> {
  const packages = getAllPackages();
  for (const it of packages) {
    await runCommandForPackage("bkpPackageJson", it);
  }

  try {
    for (const it of packages) {
      await runCommandForPackage("updatePackageVersion", it, version);
    }
    for (const it of packages) {
      await runCommandForPackage("publish", it, version);
    }
  } catch (e) {
    console.error(chalk.red("SOMETHING GOES WRONG"));
    throw e;
  } finally {
    for (const it of packages) {
      await runCommandForPackage("restorePackageJson", it);
    }
  }
}
