import {runCommandForPackage} from "../commandRunner";
import {packageHasEslintConfig} from "../utils";

export async function ci(packageName: string): Promise<void> {
  const promises = [];
  if (packageHasEslintConfig(packageName)) {
    promises.push(runCommandForPackage("lint", packageName));
  }
  promises.push(runCommandForPackage("build", packageName));
  await Promise.all(promises);
}
