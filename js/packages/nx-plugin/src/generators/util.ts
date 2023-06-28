import {removeDependenciesFromPackageJson, Tree, updateProjectConfiguration} from "@nx/devkit";
import {addMinimalPublishScript} from "@nx/js/src/utils/minimal-publish-script";
import {readProjectConfiguration} from "nx/src/generators/utils/project-configuration";

export const commonTweaks = (tree: Tree, type: string, name: string) => {
  const publishScriptPath = addMinimalPublishScript(tree);

  const projectConfiguration = readProjectConfiguration(tree, name);
  projectConfiguration.tags = [`type:${type}`];
  projectConfiguration.targets.publish = {
    command: `node ${publishScriptPath} ${name} {args.ver} {args.tag}`,
    dependsOn: ['build']
  };
  updateProjectConfiguration(
    tree,
    name,
    projectConfiguration
  );

  tree.delete(`packages/${name}/README.md`);
  tree.delete(".prettierignore");
  tree.delete(".prettierrc");
  removeDependenciesFromPackageJson(tree, [], ["prettier"]);
}
