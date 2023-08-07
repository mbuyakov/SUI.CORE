export interface ImportWithAlias {
  originalName: string;
  alias?: string;
}
export interface ParsedImport {
  from: string;
  import?: string;
  nsImport?: string;
  namedImports: ImportWithAlias[];
}
