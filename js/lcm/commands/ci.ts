import {runCommandForPackage} from "../commandRunner";
import {packageHasEslintConfig} from "../utils";

export async function ci(packageName: string): Promise<void> {
  if (packageHasEslintConfig(packageName)) {
    await runCommandForPackage("lint", packageName);
  }
  await runCommandForPackage("build", packageName);
}
