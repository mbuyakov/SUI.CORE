import {Tree} from "@nx/devkit";
import {tsquery} from "@phenomnomnominal/tsquery";
import {getProjects} from "nx/src/generators/utils/project-configuration";
import {SuiMigratorGeneratorSchema} from "./schema";
import {createPrinter, EmitHint, factory, ImportDeclaration, NewLineKind, StringLiteral} from "typescript";

const printer = createPrinter({
  newLine: NewLineKind.LineFeed,
});

function visitAllFiles(tree: Tree, path: string, callback: (filePath: string) => void) {
  tree.children(path).forEach((fileName) => {
    const filePath = `${path}/${fileName}`;
    console.log(`Process path ${filePath}`);
    if (!tree.isFile(filePath)) {
      visitAllFiles(tree, filePath, callback);
    } else {
      callback(filePath);
    }
  });
}

const mapModules = {
  "@material-ui/core": "@sui/deps-material",
  "@mui/material": "@sui/deps-material",
  "antd": "@sui/deps-antd",
  "typescript-ioc": "@sui/deps-ioc",
  "@sui/amcharts": "@sui/deps-amcharts",
};

export function remapImports(projectName: string, content: string): string {

  return tsquery.replace(content, "ImportDeclaration", (node: ImportDeclaration) => {
    let newName: string;

    for (const oldName of Object.keys(mapModules)) {
      if (mapModules[oldName] != `@sui/${projectName}` // Don't replace yourself
        && (node.moduleSpecifier as StringLiteral).text.startsWith(oldName) // If import contain out managed modules
      ) {
        newName = mapModules[oldName];
      }
    }

    if (!newName) {
      return;
    }

    // If used import default - probably it's from submodule, replace with named import
    const namedImports = node.importClause.namedBindings || factory.createNamedImports([
      factory.createImportSpecifier(node.importClause.isTypeOnly, undefined, node.importClause.name)
    ]);

    node = factory.updateImportDeclaration(
      node,
      node.modifiers,
      factory.updateImportClause(
        node.importClause,
        node.importClause.isTypeOnly,
        undefined,
        namedImports
      ),
      factory.createStringLiteral(newName),
      node.assertClause
    );

    return printer.printNode(EmitHint.Unspecified, node, node.getSourceFile());
  });
}

export async function suiMigratorGenerator(tree: Tree, schema: SuiMigratorGeneratorSchema) {
  const projects = getProjects(tree);
  projects.forEach(project => {
    console.log(`Process project ${project.name}`);
    visitAllFiles(tree, project.sourceRoot, (filePath) => {
      const fileEntry = tree.read(filePath);
      const content = fileEntry.toString();
      let newContent = remapImports(project.name, content);
      if (newContent !== content) {
        tree.write(filePath, newContent);
      }
    });
  });
}

export default suiMigratorGenerator;
