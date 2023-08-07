import {factory, ImportClause, ImportDeclaration} from "typescript";
import {ParsedImport} from "./ParsedImport";

export function printImport(parsedImport: ParsedImport): ImportDeclaration {
  let importClause: ImportClause | undefined = undefined;

  if (parsedImport.import || parsedImport.nsImport || parsedImport.namedImports.length) {
    importClause = factory.createImportClause(
      false,
      parsedImport.import
        ? factory.createIdentifier(parsedImport.import)
        : undefined,
      parsedImport.nsImport
        ? factory.createNamespaceImport(factory.createIdentifier(parsedImport.nsImport))
        : parsedImport.namedImports.length
          ? factory.createNamedImports(
            parsedImport.namedImports.map(it =>
            factory.createImportSpecifier(
              false,
              it.alias
                ? factory.createIdentifier(it.originalName)
                : undefined,
              factory.createIdentifier(it.alias ? it.alias : it.originalName)
            )
            )
          )
          : undefined
    );
  }

  return factory.createImportDeclaration(
    undefined,
    importClause,
    factory.createStringLiteral(parsedImport.from),
    undefined
  );
}
