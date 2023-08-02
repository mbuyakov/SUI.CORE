import {readJson, Tree} from "@nx/devkit";
import {SuiMigratorGeneratorSchema} from "./schema";
import {remapExternalImports} from "./modules/remapExternalImports";
import {remapIcons} from "./modules/remapIcons";
import {remapOldPackages} from "./modules/remapOldPackages";
import {dedupeImport} from "./modules/dedupeImport";
import {visitAllFiles, visitAllProjects} from "../../utils/visitors";
import {remapDeprecated} from "./modules/remapDeprecated";

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

      const projectName = readJson(tree, `${project.root}/package.json`).name;

      newContent = remapExternalImports(projectName, newContent);
      newContent = remapIcons(newContent);
      newContent = remapOldPackages(projectName, newContent);
      newContent = remapDeprecated(newContent);
      newContent = dedupeImport(newContent);

      if (newContent !== content) {
        tree.write(filePath, newContent);
      }
    });
  });
}

export default suiMigratorGenerator;
