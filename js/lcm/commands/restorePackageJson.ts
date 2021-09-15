import * as fs from "fs";
import {getPackagePath} from "../utils";

export function restorePackageJson(packageName: string) {
  fs.renameSync(`${getPackagePath(packageName)}/package-bkp.json`, `${getPackagePath(packageName)}/package.json`)
}
