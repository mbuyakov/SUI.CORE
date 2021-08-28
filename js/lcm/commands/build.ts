import * as fs from "fs";
import * as child_process from "child_process";
const chalk = require(`${__dirname}/../../node_modules/chalk`);
import {getPackagePath, wrapSpawn} from "../utils";

async function fatherBuild(packageName: string): Promise<number> {
  const spawnedProcess = child_process.spawn("father-build", {
    env: {
      FORCE_COLOR: '1',
      PACKAGE: packageName,
      ...process.env
    },
    cwd: `${__dirname}/../..`
  });

  return wrapSpawn("father-build", spawnedProcess);
}

async function tscAlias(packageName: string): Promise<number> {
  const spawnedProcess = child_process.spawn("tsc-alias", ["-p", "tsconfig.json"], {
    cwd: getPackagePath(packageName)
  });

  return wrapSpawn("tsc-alias", spawnedProcess);
}

// Export ... was in found '@sui/all'
// https://github.com/babel/babel/issues/8361
function fixBabelWarning(packageNameOrPath: string): void {
  const path = packageNameOrPath.indexOf("/") > -1 ? packageNameOrPath : `${getPackagePath(packageNameOrPath)}/es`;
  const stat = fs.statSync(path);

  if (stat.isDirectory()) {
    fs.readdirSync(path).forEach(item => {
      fixBabelWarning(`${path}/${item}`);
    });
  } else if (stat.isFile()) {
    if (fs.readFileSync(path).toString() === "export {};") {
      console.log(`${chalk.cyan("fix-babel-warning")} stdout: Fix file ${path}`);
      fs.writeFileSync(path, "");
    }
  }
}

export async function build(packageName: string): Promise<void> {
  await fatherBuild(packageName);
  await tscAlias(packageName);
  fixBabelWarning(packageName);
}
