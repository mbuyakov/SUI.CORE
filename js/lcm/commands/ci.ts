import {runCommandForPackage} from "../commandRunner";
import {packageHasEslintConfig} from "../utils";
import {build} from "./build";

export async function ci(packageName: string): Promise<void> {
  if (packageHasEslintConfig(packageName) && packageName != "linter") {
    await runCommandForPackage("lint", packageName);
  }
  await runCommandForPackage("build", packageName);
}
