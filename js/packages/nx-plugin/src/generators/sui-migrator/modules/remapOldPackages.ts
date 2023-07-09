import {factory, ImportDeclaration, ImportSpecifier, isNamedImports, StringLiteral} from "typescript";
import {logWithPrefix} from "../../../utils/logger";
import {tsquery, printNode} from "../../../utils/typescript";
import {newImports} from  "../../../utils/consts";


const inversedNewImports = Object.keys(newImports)
  .flatMap(key => newImports[key].map(value => [value, key]))
  .reduce((prev, cur) => {
    prev[cur[0]] = cur[1];
    return prev;
  }, {});

const oldModules = ["@sui/all", "@sui/ui-old-core", "@sui/ui-old-react"];
export function remapOldPackages(packageName: string, content: string): string {

  return tsquery.replace(content, "ImportDeclaration", (node: ImportDeclaration) => {
    const moduleName = (node.moduleSpecifier as StringLiteral).text;

    const isOldModule = oldModules.includes(packageName);
    const isImportFromOldModule = oldModules.includes(moduleName);

    if (!(isImportFromOldModule || (isOldModule && moduleName.startsWith("@/")))) {
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
        logWithPrefix("remapOldPackages", `Replace ${it.name.text} from ${moduleName} to ${inversedNewImports[it.name.text]}`);

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

    return imports
      .map(printNode)
      .join("\n");
  });
}
