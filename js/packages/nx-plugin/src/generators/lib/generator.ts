import {removeDependenciesFromPackageJson, Tree, updateProjectConfiguration} from '@nx/devkit';
import {LibGeneratorSchema} from './schema';
import * as jsGen from "@nx/js/src/generators/library/library";
import {addMinimalPublishScript} from "@nx/js/src/utils/minimal-publish-script";
import {readProjectConfiguration} from "nx/src/generators/utils/project-configuration";

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

  const publishScriptPath = addMinimalPublishScript(tree);

  const projectConfiguration = readProjectConfiguration(tree, name);
  projectConfiguration.tags = [`type:${options.type}`];
  projectConfiguration.targets.publish = {
    command: `node ${publishScriptPath} ${name} {args.ver} {args.tag}`,
    dependsOn: ['build']
  };
  updateProjectConfiguration(
    tree,
    name,
    projectConfiguration
  );

  tree.delete(`.prettierignore`);
  tree.delete(`.prettierrc`);
  removeDependenciesFromPackageJson(tree, [], ["prettier"]);
}

export default libGenerator;
