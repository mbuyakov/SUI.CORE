import * as child_process from "child_process";
import {getPackagePath, wrapSpawn} from "../utils";

export async function publish(packageName: string, version: string): Promise<void> {
  const spawnedProcess = child_process.spawn("yarn", `publish --registry http://verdaccio.smp.cloudcom.ru/ --non-interactive --no-git-tag-version --new-version ${version}`.split(" "), {
    env: {
      FORCE_COLOR: '1',
      ...process.env
    },
    cwd: getPackagePath(packageName)
  });

  await wrapSpawn("publish", spawnedProcess);
}
