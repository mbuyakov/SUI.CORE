import {Tree} from "@nx/devkit";
import {getProjects} from "nx/src/generators/utils/project-configuration";
import {SuiMigratorGeneratorSchema} from "./schema";
import {remapImports} from "./remapImports";
import {remapIcons} from "./remapIcons";
import {chalk} from "./util";
import {dedupeImport} from "./dedupeImport";

function visitAllFiles(tree: Tree, path: string, callback: (filePath: string) => void) {
  tree.children(path).forEach((fileName) => {
    const filePath = `${path}/${fileName}`;
    console.log(chalk.grey(`Process path ${filePath}`));
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
    console.log(`Process project ${project.name}`);
    visitAllFiles(tree, project.sourceRoot, (filePath) => {
      const fileEntry = tree.read(filePath);
      const content = fileEntry.toString();
      let newContent = content.toString();

      newContent = remapImports(project.name, newContent);
      newContent = remapIcons(newContent);
      newContent = dedupeImport(newContent);

      if (newContent !== content) {
        tree.write(filePath, newContent);
      }
    });
  });
}

export default suiMigratorGenerator;
