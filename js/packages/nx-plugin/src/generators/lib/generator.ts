import {Tree} from "@nx/devkit";
import {LibGeneratorSchema} from "./schema";
import * as jsGen from "@nx/js/src/generators/library/library";
import {commonTweaks} from "../../utils/commonTweaks";

export async function libGenerator(tree: Tree, options: LibGeneratorSchema) {
  const name = `${options.type}-${options.name}`;

  await jsGen.libraryGenerator(tree, {
    name,
    bundler: "tsc",
    linter: "eslint",
    strict: true,
    testEnvironment: "jsdom",
    unitTestRunner: "jest",
    importPath: `@sui/${name}`
  });

  commonTweaks(tree, options.type, name);
}

export default libGenerator;
