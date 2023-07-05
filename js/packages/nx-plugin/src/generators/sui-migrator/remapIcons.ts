import {factory, ImportDeclaration, NamedImports, StringLiteral} from "typescript";
import {logRemap, printNode} from "./util";
import {tsquery} from "./tsqeury";

const SUFFIX = "MuiIcons.";

export function remapIcons(content: string): string {
  const ast = tsquery.ast(content);

  const iconsImports: ImportDeclaration[] = [];
  iconsImports.push(...tsquery<ImportDeclaration>(ast, "ImportDeclaration:has(StringLiteral[value=/@mui.icons-material.*/])"));
  iconsImports.push(...tsquery<ImportDeclaration>(ast, "ImportDeclaration:has(StringLiteral[value=/@material-ui.icons.*/])"));

  if (!iconsImports.length) {
    return content;
  }

  content = tsquery.remove(content, "ImportDeclaration:has(StringLiteral[value=/@mui.icons-material.*/])", () => true, true);
  content = tsquery.remove(content, "ImportDeclaration:has(StringLiteral[value=/@material-ui.icons.*/])", () => true, true);

  const nameMap = {};

  iconsImports.forEach(importDeclaration => {
    // Default import from subpath. Replace icon name to name from last part of path
    if (importDeclaration.importClause.name) {
      nameMap[importDeclaration.importClause.name.text] = SUFFIX + (importDeclaration.moduleSpecifier as StringLiteral).text.split("/").pop();
    } else {
      (importDeclaration.importClause.namedBindings as NamedImports).elements.forEach(importSpecifier => {
        nameMap[importSpecifier.name.text] = SUFFIX + importSpecifier.name.text;
      });
    }
  });

  Object.keys(nameMap).forEach(key => {
    logRemap("remapIcons", `Replace ${key} to ${nameMap[key]}`);

    content = tsquery.jsxReplace(content, `Identifier[name="${key}"]`, () => {
      return nameMap[key];
    });
  });

  let importReplaced = false;
  content = tsquery.replace(content, "ImportDeclaration", (importDeclaration: ImportDeclaration) => {
    if (importReplaced) {
      return;
    }

    importReplaced = true;
    return printNode(
        factory.createImportDeclaration(
          undefined,
          factory.createImportClause(
            false,
            undefined,
            factory.createNamedImports([
              factory.createImportSpecifier(
                false,
                undefined,
                factory.createIdentifier("MuiIcons")
              )
            ])
          ),
          factory.createStringLiteral("@sui/deps-material")
        )
      )
        .replace(/{ /g, "{")
        .replace(/ }/g, "}")
      + "\n"
      + importDeclaration.getText();
  });

  return content;
}
