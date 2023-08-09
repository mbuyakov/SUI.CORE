import {ImportDeclaration, ImportSpecifier, isNamedImports, StringLiteral} from "typescript";
import {logWithPrefix} from "../../../utils/logger";
import {newImports} from  "../../../utils/consts";
// eslint-disable-next-line @nx/enforce-module-boundaries
import {astReplace, ParsedImportDeclaration, parseImportSpecifier, printImportDeclaration, printNodes} from "@sui/lib-typescript-ast";


const inversedNewImports = Object.keys(newImports)
  .flatMap(key => newImports[key].map(value => [value, key]))
  .reduce((prev, cur) => {
    prev[cur[0]] = cur[1];
    return prev;
  }, {});

const oldModules = ["@sui/all", "@sui/ui-old-core", "@sui/ui-old-react"];
export function remapOldPackages(packageName: string, content: string): string {

  return astReplace(content, "ImportDeclaration", (node: ImportDeclaration) => {
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

    const imports: ParsedImportDeclaration[] = [];

    importSpecifiers = importSpecifiers.filter(it => {
      if (inversedNewImports[it.name.text]) {
        logWithPrefix("remapOldPackages", `Replace ${it.name.text} from ${moduleName} to ${inversedNewImports[it.name.text]}`);

        imports.push({
          namedImports: [
            {
              originalName: it.name.text
            }
          ],
          from: inversedNewImports[it.name.text]
        });

        return false;
      } else {
        return true;
      }
    });

    if (importSpecifiers.length) {
      imports.push({
        namedImports: importSpecifiers.map(it => parseImportSpecifier(it)),
        from: moduleName
      });
    }

    return printNodes(imports.map(it => printImportDeclaration(it)));
  });
}
