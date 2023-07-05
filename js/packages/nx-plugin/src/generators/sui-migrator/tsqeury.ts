import {TSQueryApi, TSQueryOptions, TSQueryStringTransformer} from "@phenomnomnominal/tsquery/dist/src/tsquery-types";
import {tsquery as _tsquery} from "@phenomnomnominal/tsquery";
import {ScriptKind} from "typescript";

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

type TSQueryApiExtended = TSQueryApi & {
  jsxReplace: TSQueryApi["replace"]
};

const api: TSQueryApiExtended = <TSQueryApiExtended>_tsquery;
api.jsxReplace = jsxReplace;
export const tsquery = api;
