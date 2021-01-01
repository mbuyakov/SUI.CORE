//Map<command, packages[]>
import {ci} from "./commands/ci";
import {getAllPackagesWithCommand, getLocalDep, packageHasCommand, packageHasEslintConfig} from "./utils";
import {lint} from "./commands/lint";
import {build} from "./commands/build";
import {bkpPackageJson} from "./commands/bkpPackageJson";
import {restorePackageJson} from "./commands/restorePackageJson";
import {updatePackageVersion} from "./commands/updatePackageVersion";
import {publish} from "./commands/publish";
import {globalCanary} from "./commands/global/globalCanary";
import {globalPublish} from "./commands/global/globalPublish";
const chalk = require(`${__dirname}/../node_modules/chalk`);

const alreadyProcessedPackages: Map<string, Array<string>> = new Map<string, Array<string>>();

export async function runCommandForPackage(command: string, packageName: string, argument: string | null = null): Promise<void> {
  try {
    console.log(`Start command ${chalk.cyan(command)} for package ${chalk.cyan(packageName)}${argument ? ` with arg ${argument}` : ""}`);
    switch (command) {
      case "ci":
        await ci(packageName);
        break;
      case "lint":
        if (!packageHasEslintConfig(packageName)) {
          throw new Error("Can't run lint without .eslintrc.js");
        }
        await lint(packageName);
        break;
      case "build":
        await build(packageName);
        break;
      case "bkpPackageJson":
        bkpPackageJson(packageName);
        break;
      case "restorePackageJson":
        restorePackageJson(packageName);
        break;
      case "updatePackageVersion":
        updatePackageVersion(packageName, argument);
        break;
      case "publish":
        await publish(packageName, argument);
        break;
      default:
        throw new Error("Unknown command");
    }
    console.log(chalk.green(`Command ${chalk.cyan(command)} for package ${chalk.cyan(packageName)} ended successfully`));
  } catch (e) {
    console.error(chalk.red(`Command ${chalk.cyan(command)} for package ${chalk.cyan(packageName)} failed`));
    throw e;
  }
}

export async function runCommandForPackageWithDep(command: string, packageName: string): Promise<void> {
  console.log(chalk.grey(`Processing package ${packageName}`));
  if (!alreadyProcessedPackages.get(command)) {
    alreadyProcessedPackages.set(command, []);
  }
  if (alreadyProcessedPackages.get(command).includes(packageName)) {
    console.log(chalk.grey(`Package ${packageName} already processed`));
    return;
  }
  const localDep = getLocalDep(packageName).filter(it => packageHasCommand(it, command));
  if (localDep.length) {
    console.log(chalk.grey(`Dependencies: ${localDep}`));
  }
  for (const it of localDep) {
    if (!alreadyProcessedPackages.get(command).includes(packageName)) {
      await runCommandForPackageWithDep(command, it);
    }
  }
  console.log(chalk.grey(`Run command for ${packageName}`));
  await runCommandForPackage(command, packageName);
  alreadyProcessedPackages.get(command).push(packageName);
}

export async function runCommandForAllPackages(command: string) {
  const packages = getAllPackagesWithCommand(command);
  if (!packages.length) {
    throw new Error(`Command ${command} not found in any packages`);
  }
  console.log(chalk.grey(`Run command for packages: ${packages}`));
  for (const it of packages) {
    await runCommandForPackageWithDep(command, it);
  }
}

export async function runGlobalCommand(command: string, argument: string | null = null): Promise<void> {
  try {
    console.log(`Start global command ${chalk.cyan(command)}${argument ? ` with arg ${argument}` : ""}`);
    switch (command) {
      case "canary":
        await globalCanary();
        break;
      case "publish":
        await globalPublish(argument);
        break;
      default:
        await runCommandForAllPackages(command);
    }
    console.log(chalk.green(`Global command ${chalk.cyan(command)} ended successfully`));
  } catch (e) {
    console.error(chalk.red(`Global command ${chalk.cyan(command)} failed`));
    throw e;
  }
}
