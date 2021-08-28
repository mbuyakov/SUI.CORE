import * as child_process from "child_process";

import {getPackagePath, wrapSpawn} from "../utils";

export async function lint(packageName: string): Promise<number> {
  const spawnedProcess = child_process.spawn("sui-linter", {
    env: {
      FORCE_COLOR: '1',
      ROOT_DIR: "src",
      ...process.env
    },
    cwd: getPackagePath(packageName)
  });

  return wrapSpawn("lint", spawnedProcess);
}
