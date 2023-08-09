export interface ImportWithAlias {
  originalName: string;
  alias?: string;
}
export interface ParsedImportDeclaration {
  from: string;
  import?: string;
  nsImport?: string;
  namedImports: ImportWithAlias[];
}
