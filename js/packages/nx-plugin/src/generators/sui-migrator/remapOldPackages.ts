import {tsquery} from "@phenomnomnominal/tsquery";
import {factory, ImportDeclaration, ImportSpecifier, isNamedImports, StringLiteral} from "typescript";
import {logRemap, printNode} from "./util";

const newImports = {
  "@sui/util-chore": [
    "DataKey",
    "normalizeDataKey",
    "concatDataKey",
    "getDataByKey",
    "DataKeyNode",
    "dataKeysToDataTree"
  ],
};

const inversedNewImports = Object.keys(newImports)
  .flatMap(key => newImports[key].map(value => [value, key]))
  .reduce((prev, cur) => {
    prev[cur[0]] = cur[1];
    return prev;
  }, {});

export function remapOldPackages(content: string): string {

  return tsquery.replace(content, "ImportDeclaration", (node: ImportDeclaration) => {
    const moduleName = (node.moduleSpecifier as StringLiteral).text;

    if (!(["@sui/all", "@sui/ui-old-core", "@sui/ui-old-react"].includes(moduleName) || moduleName.startsWith("@/"))) {
      return;
    }

    if (!isNamedImports(node.importClause.namedBindings)){
      return;
    }

    let importSpecifiers: ImportSpecifier[] = [...node.importClause.namedBindings.elements];

    if (importSpecifiers.every(it => !inversedNewImports[it.name.text])) {
      return;
    }

    const imports: ImportDeclaration[] = [];

    importSpecifiers = importSpecifiers.filter(it => {
      if (inversedNewImports[it.name.text]) {
        logRemap("remapOldPackages", `Replace ${it.name.text} from ${moduleName} to ${inversedNewImports[it.name.text]}`);

        imports.push(
          factory.createImportDeclaration(
            undefined,
            factory.createImportClause(
              false,
              undefined,
              factory.createNamedImports([
                factory.createImportSpecifier(
                  false,
                  undefined,
                  factory.createIdentifier(it.name.text)
                )
              ])
            ),
            factory.createStringLiteral(inversedNewImports[it.name.text])
          )
        );

        return false;
      } else {
        return true;
      }
    });

    if (importSpecifiers.length) {
      imports.push(
        factory.createImportDeclaration(
          undefined,
          factory.createImportClause(
            false,
            undefined,
            factory.createNamedImports(importSpecifiers)
          ),
          factory.createStringLiteral(moduleName)
        )
      );
    }

    return imports.map(printNode)
      .join("\n")
      .replace(/{ /g, "{")
      .replace(/ }/g, "}");
  });
}