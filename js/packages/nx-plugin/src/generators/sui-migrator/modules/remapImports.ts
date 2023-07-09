import {factory, ImportDeclaration, StringLiteral} from "typescript";
import {mapModules} from "../../../utils/consts";
import {logWithPrefix} from "../../../utils/logger";
import {printNode, tsquery} from "../../../utils/typescript";

export function remapImports(projectName: string, content: string): string {

  return tsquery.replace(content, "ImportDeclaration:has(ImportClause)", (node: ImportDeclaration) => {
    const moduleName = (node.moduleSpecifier as StringLiteral).text;
    let newName = Object.entries(mapModules)
      .find(([oldName]) => moduleName == oldName || moduleName.startsWith(oldName + "/"))
      ?.[1];

    if (
      !newName
      // Don't replace yourself
      || newName === `@sui/${projectName}`
    ) {
      return;
    }

    logWithPrefix("remapImports", `Replace ${moduleName} to ${newName}`);

    let namedImports = node.importClause.namedBindings;

    // If used default import - probably it's from submodule, replace with named import
    if (!namedImports) {
      namedImports = factory.createNamedImports([
        factory.createImportSpecifier(node.importClause.isTypeOnly, undefined, node.importClause.name)
      ]);
    }
    return printNode(
      factory.updateImportDeclaration(
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
      )
    );
  });
}
