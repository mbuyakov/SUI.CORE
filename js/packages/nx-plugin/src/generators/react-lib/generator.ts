import {Tree} from "@nx/devkit";
import {ReactLibGeneratorSchema} from "./schema";
import * as reactGen from "@nx/react";
import {Linter} from "@nx/linter";
import {commonTweaks} from "../utils";

export async function reactLibGenerator(tree: Tree, options: ReactLibGeneratorSchema) {
  const name = `${options.type}-${options.name}`;

  await reactGen.libraryGenerator(tree, {
    name,
    linter: Linter.EsLint,
    component: true,
    compiler: "babel",
    style: "@emotion/styled",
    unitTestRunner: "jest",
    bundler: "rollup",
    publishable: true,
    importPath: `@sui/${name}`,
    strict: true
  });

  commonTweaks(tree, options.type, name);
}


export default reactLibGenerator;
