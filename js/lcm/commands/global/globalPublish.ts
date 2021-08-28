import {runCommandForPackage} from "../../commandRunner";
import {getAllPackages} from "../../utils";

const chalk = require(`${__dirname}/../../../node_modules/chalk`);

export async function globalPublish(version: string): Promise<void> {
  const packages = getAllPackages();
  await Promise.all(packages.map(it => runCommandForPackage("bkpPackageJson", it)))

  try {
    await Promise.all(packages.map(it => runCommandForPackage("updatePackageVersion", it, version)))
    await Promise.all(packages.map(it => runCommandForPackage("publish", it, version)))
  } catch (e) {
    console.error(chalk.red("SOMETHING GOES WRONG"));
    throw e;
  } finally {
      await Promise.all(packages.map(it => runCommandForPackage("restorePackageJson", it)))
  }
}
