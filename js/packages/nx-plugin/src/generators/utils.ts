import {ProjectConfiguration, readJson, removeDependenciesFromPackageJson, Tree, updateJson, updateProjectConfiguration} from "@nx/devkit";
import {addMinimalPublishScript} from "@nx/js/src/utils/minimal-publish-script";
import {getProjects, readProjectConfiguration} from "nx/src/generators/utils/project-configuration";
import {setSpinnerPrefix, setSpinnerText, stopSpinner} from "../utils/logger";

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
}

export function visitAllFiles(tree: Tree, path: string, callback: (filePath: string) => void) {
  tree.children(path).forEach((fileName) => {
    const filePath = `${path}/${fileName}`;
    setSpinnerText(filePath);
    if (!tree.isFile(filePath)) {
      visitAllFiles(tree, filePath, callback);
    } else {
      callback(filePath);
    }
  });
}

export function visitAllFolders(tree: Tree, path: string, callback: (folderPath: string) => void, _isNested = false) {
  if (!_isNested) {
    setSpinnerText(path);
    callback(path);
  }
  tree.children(path).forEach((folderName) => {
    const folderPath = `${path}/${folderName}`;
    if (!tree.isFile(folderPath)) {
      setSpinnerText(folderPath);
      callback(folderPath);
      visitAllFolders(tree, folderPath, callback, true);
    }
  });
}

export function visitAllProjects(tree: Tree, callback: (project: ProjectConfiguration) => void) {
  const projects = getProjects(tree);
  projects.forEach(project => {
    setSpinnerPrefix(`Process project ${project.name}`);
    callback(project);
    stopSpinner();
  });
}
