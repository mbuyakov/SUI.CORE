import * as child_process from "child_process";

import {getPackagePath, wrapSpawn} from "../utils";

//TODO FIX=1 && TIMING=1 && --watch
export async function lint(packageName: string): Promise<void> {
  const spawnedProcess = child_process.spawn("sui-linter", {
    env: {
      FORCE_COLOR: '1',
      ROOT_DIR: "src",
      ...process.env
    },
    cwd: getPackagePath(packageName)
  });

  await wrapSpawn("lint", spawnedProcess);
}
