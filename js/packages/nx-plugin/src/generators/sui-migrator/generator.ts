import {Tree} from "@nx/devkit";
import {SuiMigratorGeneratorSchema} from "./schema";
import {visitAllFiles, visitAllProjects} from "../utils";
import {remapImports} from "./modules/remapImports";
import {remapIcons} from "./modules/remapIcons";
import {remapOldPackages} from "./modules/remapOldPackages";
import {dedupeImport} from "./modules/dedupeImport";

export async function suiMigratorGenerator(tree: Tree, schema: SuiMigratorGeneratorSchema) {
  visitAllProjects(tree, project => {
    visitAllFiles(tree, project.sourceRoot, filePath => {
      if (
        !filePath.endsWith(".ts")
        && !filePath.endsWith(".tsx")
      ) {
        return;
      }
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
