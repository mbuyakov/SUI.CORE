import {Tree} from "@nx/devkit";
import {IndexGeneratorSchema} from "./schema";
import {logSymbols, logWithPrefix} from "../../utils/logger";
import {visitAllFolders, visitAllProjects} from "../../utils/visitors";

const naturalSorter = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase());

function getFolders(tree: Tree, folderPath: string) {
  return tree.children(folderPath)
    .filter(it =>
      !tree.isFile(`${folderPath}/${it}`)
      && it != "__snapshots__"
    )
    .sort(naturalSorter);
}

function getFiles(tree: Tree, folderPath: string) {
  return tree.children(folderPath)
    .filter(it =>
      tree.isFile(`${folderPath}/${it}`)
      && it !== "index.ts"
      && !it.startsWith(".")
      && !it.includes(".spec.")
      && !it.includes(".test.")
      && !it.includes(".stories.")
      && !it.endsWith(".less")
    )
    .sort(naturalSorter);
}

function visitFolder(tree: Tree, folderPath: string) {
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

  const folders = getFolders(tree, folderPath);
  const files = getFiles(tree, folderPath);

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
}

export async function indexGenerator(tree: Tree, options: IndexGeneratorSchema) {
  visitAllProjects(tree, project => {
    if (project.name === "nx-plugin") {
      return;
    }

    visitAllFolders(tree, project.sourceRoot, folderPath => {
      if (folderPath.endsWith("__snapshots__")) {
        return;
      }

      visitFolder(tree, folderPath);
    });
  });
}

export default indexGenerator;
