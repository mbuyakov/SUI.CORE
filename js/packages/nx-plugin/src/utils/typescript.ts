import {TSQueryApi, TSQueryOptions, TSQueryStringTransformer} from "@phenomnomnominal/tsquery/dist/src/tsquery-types";
// eslint-disable-next-line no-restricted-imports
import {tsquery as _tsquery} from "@phenomnomnominal/tsquery";
import {ScriptKind, Node, createPrinter, EmitHint, NewLineKind, isImportDeclaration} from "typescript";


// Copy of original tsquery.replace with added scriptKind for ast
function jsxReplace(
  source: string,
  selector: string,
  stringTransformer: TSQueryStringTransformer,
  options: TSQueryOptions = {}
): string {
  const ast = _tsquery.ast(source, undefined, ScriptKind.TSX);
  const matches = _tsquery.query(ast, selector, options);
  const replacements = matches.map((node) => stringTransformer(node));
  const reversedMatches = matches.reverse();
  const reversedReplacements = replacements.reverse();
  let result = source;
  reversedReplacements.forEach((replacement, index) => {
    if (replacement != null) {
      const match = reversedMatches[index];
      result = `${result.substring(
        0,
        match.getStart()
      )}${replacement}${result.substring(match.getEnd())}`;
    }
  });
  return result;
}

function remove(
  source: string,
  selector: string,
  additionalFilter: (node: Node) => boolean,
  removeBreakLineAtEnd: boolean,
  options: TSQueryOptions = {}
): string {
  const ast = _tsquery.ast(source, undefined, ScriptKind.TSX);
  const matches = _tsquery.query(ast, selector, options);
  const replacements = matches.map((node) => additionalFilter(node));
  const reversedMatches = matches.reverse();
  const reversedReplacements = replacements.reverse();
  let result = source;
  reversedReplacements.forEach((replacement, index) => {
    if (replacement) {
      const match = reversedMatches[index];
      result = `${result.substring(
        0,
        match.getStart()
      )}${result.substring(match.getEnd() + (removeBreakLineAtEnd ? 1 : 0))}`;
    }
  });
  return result;
}

type TSQueryApiExtended = TSQueryApi & {
  jsxReplace: TSQueryApi["replace"]
  remove: typeof remove
};

const api: TSQueryApiExtended = <TSQueryApiExtended>_tsquery;
api.jsxReplace = jsxReplace;
api.remove = remove;
export const tsquery = api;


export const printer = createPrinter({
  newLine: NewLineKind.LineFeed,
});

export function printNode(node: Node) {
  let text =  printer.printNode(EmitHint.Unspecified, node, node.getSourceFile());
  if (isImportDeclaration(node)) {
    text = text
      .replace("{ ", "{")
      .replace(" }", "}");
  }
  return text;
}
