import * as child_process from "child_process";
import {getPackagePath, wrapSpawn} from "../utils";

export async function publish(packageName: string, version: string): Promise<number> {
  const spawnedProcess = child_process.spawn("yarn", `publish --registry ${process.env.NPM_REGISTRY || "https://nexus.suilib.ru/repository/npm-sui/"} --non-interactive --no-git-tag-version --new-version ${version}`.split(" "), {
    env: {
      FORCE_COLOR: '1',
      ...process.env
    },
    cwd: getPackagePath(packageName)
  });

  return  wrapSpawn("publish", spawnedProcess);
}
