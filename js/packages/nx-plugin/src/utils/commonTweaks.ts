import {
  addDependenciesToPackageJson,
  readJson,
  readProjectConfiguration,
  removeDependenciesFromPackageJson,
  Tree,
  updateJson,
  updateProjectConfiguration
} from "@nx/devkit";
import {addMinimalPublishScript} from "@nx/js/src/utils/minimal-publish-script";

export function commonTweaks(tree: Tree, type: string, name: string) {
  const publishScriptPath = addMinimalPublishScript(tree);

  const projectConfiguration = readProjectConfiguration(tree, name);
  projectConfiguration.tags = [`type:${type}`];
  projectConfiguration.targets.publish = {
    command: `node ${publishScriptPath} ${name} {args.ver} {args.tag}`,
    dependsOn: ["build"]
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

  const paths = readJson(tree, "tsconfig.base.json").compilerOptions.paths;

  if (tree.isFile("packages/ui-old-core/tsconfig.json")) {
    updateJson(tree, "packages/ui-old-core/tsconfig.json", config => {
      config.compilerOptions.paths = paths;
      config.compilerOptions.paths["@/*"] = ["packages/ui-old-core/src/*"];
      return config;
    });
  }

  if (tree.isFile("packages/ui-old-react/tsconfig.json")) {
    updateJson(tree, "packages/ui-old-react/tsconfig.json", config => {
      config.compilerOptions.paths = paths;
      config.compilerOptions.paths["@/*"] = ["packages/ui-old-react/src/*"];
      return config;
    });
  }

  if (tree.isFile("packages/bundle-all/package.json")) {
    addDependenciesToPackageJson(
      tree,
      {
        [`@sui/${name}`]: "0.0.1"
      },
      {},
      "packages/bundle-all/package.json"
    );
  }
}
