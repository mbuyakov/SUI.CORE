import {ProjectConfiguration, Tree} from "@nx/devkit";
import {setSpinnerPrefix, setSpinnerText, stopSpinner} from "./logger";
import {getProjects} from "nx/src/generators/utils/project-configuration";

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
    if (project.name == "nx-plugin") {
      return;
    }

    setSpinnerPrefix(`Process project ${project.name}`);
    callback(project);
    stopSpinner();
  });
}
