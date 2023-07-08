import {Tree} from "@nx/devkit";
import {SuiMigratorGeneratorSchema} from "./schema";
import {remapImports} from "./remapImports";
import {remapIcons} from "./remapIcons";
import {dedupeImport} from "./dedupeImport";
import {remapOldPackages} from "./remapOldPackages";
import {visitAllFiles, visitAllProjects} from "../utils";

export async function suiMigratorGenerator(tree: Tree, schema: SuiMigratorGeneratorSchema) {
  visitAllProjects(tree, project => {
    visitAllFiles(tree, project.sourceRoot, filePath => {
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
  });
}

export default suiMigratorGenerator;
