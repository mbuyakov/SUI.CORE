import {Tree} from "@nx/devkit";
import {getProjects} from "nx/src/generators/utils/project-configuration";
import {SuiMigratorGeneratorSchema} from "./schema";
import {remapImports} from "./remapImports";
import {remapIcons} from "./remapIcons";
import {dedupeImport} from "./dedupeImport";
import {remapOldPackages} from "./remapOldPackages";
import {setSpinnerPrefix, stopSpinner, setSpinnerText} from "../../utils/logger";

function visitAllFiles(tree: Tree, path: string, callback: (filePath: string) => void) {
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

export async function suiMigratorGenerator(tree: Tree, schema: SuiMigratorGeneratorSchema) {
  const projects = getProjects(tree);
  projects.forEach(project => {
    setSpinnerPrefix(`Process project ${project.name}`);
    visitAllFiles(tree, project.sourceRoot, (filePath) => {
      const fileEntry = tree.read(filePath);
      const content = fileEntry.toString();
      let newContent = content.toString();

      newContent = remapImports(project.name, newContent);
      newContent = remapIcons(newContent);
      newContent = remapOldPackages(newContent);
      newContent = dedupeImport(newContent);

      if (newContent !== content) {
        tree.write(filePath, newContent);
      }
    });
    stopSpinner();
  });
}

export default suiMigratorGenerator;
