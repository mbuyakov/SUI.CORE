import * as fs from "fs";
import {getPackagePath} from "../utils";

export function updatePackageVersion(packageName: string, version: string) {
  const packageJson = require(`${getPackagePath(packageName)}/package.json`);
  packageJson.version = version;
  Object.keys(packageJson.dependencies ?? {}).filter(it => it.startsWith("@sui/")).forEach(it => packageJson.dependencies[it] = version);
  Object.keys(packageJson.devDependencies ?? {}).filter(it => it.startsWith("@sui/")).forEach(it => packageJson.devDependencies[it] = version);
  Object.keys(packageJson.peerDependencies ?? {}).filter(it => it.startsWith("@sui/")).forEach(it => packageJson.peerDependencies[it] = version);
  fs.writeFileSync(`${getPackagePath(packageName)}/package.json`, JSON.stringify(packageJson, null, 2))
}
