import {ImportDeclaration, NamedImports, StringLiteral} from "typescript";
import {logWithPrefix} from "../../../utils/logger";
// eslint-disable-next-line @nx/enforce-module-boundaries
import {astReplace} from "@sui/lib-typescript-ast";

const SUFFIX = "MuiIcons.";

export function remapIcons(content: string): string {
  const iconsImports: ImportDeclaration[] = [];

  content = astReplace(content, "ImportDeclaration:has(StringLiteral[value=/@mui.icons-material.*/])", (node: ImportDeclaration) => {
    iconsImports.push(node);
    return "import {MuiIcons} from \"@sui/deps-material\";";
  });

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
    logWithPrefix("remapIcons", `Replace ${key} to ${nameMap[key]}`);

    content = astReplace(content, `Identifier[name="${key}"]`, () => {
      return nameMap[key];
    });
  });

  return content;
}
