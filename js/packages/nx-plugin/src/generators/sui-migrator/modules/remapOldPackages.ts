import {ImportDeclaration} from "typescript";
import {logWithPrefix} from "../../../utils/logger";
import {
  astReplace,
  ParsedImportDeclaration,
  parseImportDeclaration,
  printImportDeclaration,
  printNodes
} from "@sui/lib-typescript-ast";
import {importsByNewPackage} from "./support/remapOldPackages";
import {oldPackages} from "../../../utils/oldPackages";


const newPackageByImports = Object.keys(importsByNewPackage)
  .flatMap(key => importsByNewPackage[key].map(value => [value, key]))
  .reduce((prev, cur) => {
    prev[cur[0]] = cur[1];
    return prev;
  }, {});

export function remapOldPackages(packageName: string, content: string): string {
  const isOldPackage = oldPackages.includes(packageName);

  return astReplace(content, "ImportDeclaration", (node: ImportDeclaration) => {
    const parsedImport = parseImportDeclaration(node);
    const isImportFromOldModule = oldPackages.includes(parsedImport.from);

    if (
      !isImportFromOldModule
      // for internal SUI packages
      && !(isOldPackage && parsedImport.from.startsWith("@/"))) {
      return;
    }

    if (!parsedImport.namedImports.length) {
      return;
    }

    let namedImports = [...parsedImport.namedImports];
    if (namedImports.every(it => !newPackageByImports[it.originalName])) {
      return;
    }

    const imports: ParsedImportDeclaration[] = [];

    namedImports = namedImports.filter(it => {
      const newPackageByImport = newPackageByImports[it.originalName];
      if (newPackageByImport) {
        logWithPrefix("remapOldPackages", `Replace ${it.originalName} from ${parsedImport.from} to ${newPackageByImport}`);

        imports.push({
          namedImports: [
            {
              originalName: it.originalName,
              alias: it.alias
            }
          ],
          from: newPackageByImport
        });

        return false;
      } else {
        return true;
      }
    });

    if (namedImports.length) {
      imports.push({
        namedImports,
        from: parsedImport.from
      });
    }

    return printNodes(imports.map(it => printImportDeclaration(it)));
  });
}
