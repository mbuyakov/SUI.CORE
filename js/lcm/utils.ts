import {ChildProcessWithoutNullStreams} from "child_process";
import * as fs from "fs";
const chalk = require(`${__dirname}/../node_modules/chalk`);

export async function wrapSpawn(prefix: string, spawnedProcess: ChildProcessWithoutNullStreams): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    prefix = chalk.cyan(prefix);
    const stdOutPrefix = `${prefix} stdout:`;
    const stdErrPrefix = `${prefix} stderr:`;

    spawnedProcess.stdout.on('data', (data) => {
      data.toString().replace(/\n$/, "").split("\n").forEach(line => console.log(stdOutPrefix, line));
    });

    spawnedProcess.stderr.on('data', (data) => {
      data.toString().replace(/\n$/, "").split("\n").forEach(line => console.log(stdErrPrefix, line));
    });

    spawnedProcess.on('close', code => {
      console.log(`${prefix} ended with exit code ${code}`);
      if (code === 0) {
        resolve(code);
      } else {
        reject(code);
      }
    });
  });
}

export function getCurPackage(): string {
  const curPackage = process.cwd().split("/").pop();
  if (curPackage === "js") {
    return "GLOBAL";
  }
  return curPackage;
}

export function getPackagePath(packageName: string): string {
  return `${__dirname}/../packages/${packageName}`;
}

export function packageHasCommand(packageName: string, command: string): boolean {
  return (require(`${getPackagePath(packageName)}/package.json`).scripts || {})[command];
}

export function getAllPackages(): string[] {
  return fs.readdirSync(`${__dirname}/../packages`, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

export function getAllPackagesWithCommand(command: string): string[] {
  return getAllPackages().filter(it => packageHasCommand(it, command));
}

export function getLocalDep(packageName: string): string[] {
  const packageJson = require(`${getPackagePath(packageName)}/package.json`);
  const dependencies = Object.keys(packageJson.dependencies ?? []).filter(it => it.startsWith("@sui/")).map(it => it.replace("@sui/", ""));
  const devDependencies = Object.keys(packageJson.devDependencies ?? []).filter(it => it.startsWith("@sui/")).map(it => it.replace("@sui/", ""));
  const peerDependencies = Object.keys(packageJson.peerDependencies ?? []).filter(it => it.startsWith("@sui/")).map(it => it.replace("@sui/", ""));
  return [...dependencies, ...devDependencies, ...peerDependencies];
}
