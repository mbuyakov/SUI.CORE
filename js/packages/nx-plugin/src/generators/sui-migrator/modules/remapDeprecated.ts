import {factory, ImportDeclaration, isNamespaceImport, QualifiedName} from "typescript";
import {logWithPrefix} from "../../../utils/logger";
import {printNode, tsquery} from "../../../utils/typescript";


export function remapDeprecated(content: string): string {
  let shouldAddImport = false;
  content = tsquery.replace(content, "QualifiedName", (node: QualifiedName) => {
    if (node.left.getText() == "JSX") {
      shouldAddImport = true;
      logWithPrefix("remapDeprecated", `Replace JSX.${node.right.getText()} to React.JSX.${node.right.getText()}`);

      return printNode(
        factory.createQualifiedName(
          factory.createQualifiedName(
            factory.createIdentifier("React"),
            factory.createIdentifier("JSX")
          ),
          node.right
        )
      );
    }
  });

  // Check if import exist
  if (shouldAddImport) {
    let hasReactImport = false;
    tsquery.query<ImportDeclaration>(content, "ImportDeclaration")
      .forEach(node => {
        if (node.moduleSpecifier?.getText() == "\"react\"") {
          if (
            node.importClause?.name?.getText() == "React" // ref: import React from "react"
            || (isNamespaceImport(node.importClause?.namedBindings) && node.importClause?.namedBindings.name.getText() == "React") // ref: import * as React from "react"
          ) {
            hasReactImport = true;
          }
        }
      });
    shouldAddImport = !hasReactImport;
  }

  if (shouldAddImport) {
    let isFirst = true;
    content = tsquery.replace(content, "ImportDeclaration", (node: ImportDeclaration) => {
      if (isFirst) {
        isFirst = false;
        return printNode(node) + "\nimport React from \"react\";";
      }
    });
  }

  return content;
}
