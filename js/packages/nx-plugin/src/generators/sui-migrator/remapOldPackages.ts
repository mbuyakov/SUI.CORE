import {tsquery} from "@phenomnomnominal/tsquery";
import {factory, ImportDeclaration, ImportSpecifier, isNamedImports, StringLiteral} from "typescript";
import {printNode} from "./util";
import {logWithPrefix} from "../../utils/logger";

const newImports = {
  "@sui/ui-observable": [
    "Observable",
    "IObservableBinderProps",
    "ObservableBinder",
    "ObservableLocalStorageValue",
    "ObservableHandler",
    "ObservableHandlerStub",
    "joinObservables2",
    "joinObservables3",
    "joinObservables4",
    "joinObservables5",
    "joinObservables6"
  ],
  "@sui/util-chore": [
    "DataKey",
    "normalizeDataKey",
    "concatDataKey",
    "getDataByKey",
    "DataKeyNode",
    "dataKeysToDataTree",
    "TOrCallback",
    "getTOrCall"
  ],
  "@sui/util-types": [
    "Class",
    "Nullable",
    "NotFunction",
    "IObjectWithIndex"
  ]
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

    return imports.map(printNode)
      .join("\n")
      .replace(/{ /g, "{")
      .replace(/ }/g, "}");
  });
}
