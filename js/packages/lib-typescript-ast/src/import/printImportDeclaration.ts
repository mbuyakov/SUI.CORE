import {factory, ImportClause, ImportDeclaration} from "typescript";
import {ParsedImportDeclaration} from "./ParsedImportDeclaration";

export function printImportDeclaration(parsedImport: ParsedImportDeclaration): ImportDeclaration {
  let importClause: ImportClause | undefined = undefined;

  if (parsedImport.import || parsedImport.nsImport || parsedImport.namedImports.length) {
    const nsImport = parsedImport.nsImport
      ? factory.createNamespaceImport(factory.createIdentifier(parsedImport.nsImport))
      : undefined;

    const namedImports = parsedImport.namedImports.length
      ? factory.createNamedImports(
        parsedImport.namedImports.map(it => {
          const propertyName = it.alias
            ? factory.createIdentifier(it.originalName)
            : undefined;

          return factory.createImportSpecifier(
            false,
            propertyName,
            factory.createIdentifier(it.alias ?? it.originalName)
          );
        })
      )
      : undefined;

    importClause = factory.createImportClause(
      false,
      parsedImport.import
        ? factory.createIdentifier(parsedImport.import)
        : undefined,
      nsImport ?? namedImports
    );
  }

  return factory.createImportDeclaration(
    undefined,
    importClause,
    factory.createStringLiteral(parsedImport.from),
    undefined
  );
}
