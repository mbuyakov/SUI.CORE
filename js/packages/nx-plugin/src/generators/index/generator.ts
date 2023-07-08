import {Tree} from "@nx/devkit";
import {IndexGeneratorSchema} from "./schema";
import {visitAllFolders, visitAllProjects} from "../utils";
import {logSymbols, logWithPrefix} from "../../utils/logger";

const naturalSorter = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase());

export async function indexGenerator(tree: Tree, options: IndexGeneratorSchema) {
  visitAllProjects(tree, project => {
    if (project.name === "nx-plugin") {
      return;
    }
    visitAllFolders(tree, project.sourceRoot, folderPath => {
      const filePath = `${folderPath}/index.ts`;
      const content = tree.exists(filePath) ? tree.read(filePath).toString() : "";
      let newContent = "";

      const isCustom = content
        .split("\n")
        .some(row => !row.startsWith("export * from") && row.length);

      if (isCustom) {
        logWithPrefix("indexGenerator", "index.ts has something other than \"export * from ...\". Ignore", logSymbols.warning);
        return;
      }

      const allContent = tree.children(folderPath);

      const folders = allContent
        .filter(it => !tree.isFile(`${folderPath}/${it}`))
        .sort(naturalSorter);

      const files = allContent
        .filter(it =>
          tree.isFile(`${folderPath}/${it}`)
          && it !== "index.ts"
          && !it.includes(".spec.")
          && !it.includes(".test.")
          && !it.includes(".stories.")
          && !it.endsWith(".less")
        )
        .sort(naturalSorter);
      if (folders.length) {
        folders.forEach(it => newContent += `export * from "./${it}";\n`);
      }

      if (files.length) {
        if (folders.length) {
          newContent += "\n";
        }
        files.forEach(it => newContent += `export * from "./${it.split(".")[0]}";\n`);
      }

      if (newContent !== content) {
        tree.write(filePath, newContent);
      }
    });
  });
}

export default indexGenerator;
