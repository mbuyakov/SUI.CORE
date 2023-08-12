import {ExportDeclaration, isNamedExports} from "typescript";

export function parseExportDeclaration(node: ExportDeclaration) {
  if (
    !node.exportClause
    || !isNamedExports(node.exportClause)
  ) {
    return [];
  }

  return node.exportClause.elements.map(it => it.name.text);
}
