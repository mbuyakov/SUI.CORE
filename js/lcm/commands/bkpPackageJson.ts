import * as fs from "fs";
import {runCommandForPackage} from "../commandRunner";
import {getPackagePath} from "../utils";

export function bkpPackageJson(packageName: string) {
  fs.copyFileSync(`${getPackagePath(packageName)}/package.json`, `${getPackagePath(packageName)}/package-bkp.json`);

  // Запасик
  process.on('SIGINT', function () {
    runCommandForPackage("restorePackageJson", packageName);
  });
}
