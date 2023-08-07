import {factory, ImportDeclaration, QualifiedName} from "typescript";
import {logWithPrefix} from "../../../utils/logger";
import {astQuery, astReplace, parseImport, printNode} from "@sui/lib-typescript-ast";


export function remapDeprecated(content: string): string {
  let shouldAddImport = false;
  content = astReplace(content, "QualifiedName", (node: QualifiedName) => {
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
    astQuery<ImportDeclaration>(content, "ImportDeclaration").forEach(node => {
      const parsedImport = parseImport(node);
      if (parsedImport.from == "react" && (parsedImport.import == "React" || parsedImport.nsImport == "React")) {
        hasReactImport = true;
      }
    });

    shouldAddImport = !hasReactImport;
  }

  if (shouldAddImport) {
    let isFirst = true;
    content = astReplace(content, "ImportDeclaration", (node: ImportDeclaration) => {
      if (isFirst) {
        isFirst = false;
        return printNode(node) + "\nimport React from \"react\";";
      }
    });
  }

  return content;
}
