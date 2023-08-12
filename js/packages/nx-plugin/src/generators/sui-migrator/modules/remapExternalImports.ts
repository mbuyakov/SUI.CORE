import {factory, ImportDeclaration, StringLiteral} from "typescript";
import {logWithPrefix} from "../../../utils/logger";
import {astReplace, printNode} from "@sui/lib-typescript-ast";
import {oldToNewDeps} from "./support/remapExternalImports";

const oldToNewDepsEntries = Object.entries(oldToNewDeps);
export function remapExternalImports(projectName: string, content: string): string {

  return astReplace(content, "ImportDeclaration:has(ImportClause)", (node: ImportDeclaration) => {
    const currentDepName = (node.moduleSpecifier as StringLiteral).text;
    const newDepName = oldToNewDepsEntries
      .find(([oldDepName]) => currentDepName == oldDepName || currentDepName.startsWith(oldDepName + "/"))
      ?.[1];

    if (
      !newDepName
      // Don't replace yourself
      || newDepName === projectName
    ) {
      return;
    }

    logWithPrefix("remapExternalImports", `Replace ${currentDepName} to ${newDepName}`);

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
        factory.createStringLiteral(newDepName),
        node.assertClause
      )
    );
  });
}
