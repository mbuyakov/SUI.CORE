/* eslint-disable no-restricted-imports */
import {StringTransformer, ScriptKind, tsquery} from "@phenomnomnominal/tsquery";

// src: https://github.com/phenomnomnominal/tsquery/blob/master/src/replace.ts
// Copy without print(ast(result, '', scriptKind))
export function astReplace(source: string, selector: string, stringTransformer: StringTransformer): string {
  const matches = tsquery.query(source, selector, ScriptKind.TSX);
  const replacements = matches.map((node) => stringTransformer(node));
  const reversedMatches = matches.reverse();
  const reversedReplacements = replacements.reverse();

  let result = source;
  reversedReplacements.forEach((replacement, index) => {
    if (replacement != null) {
      const match = reversedMatches[index];
      const start = result.substring(0, match.getStart());
      const end = result.substring(match.getEnd());
      result = `${start}${replacement}${end}`;
    }
  });
  return result;
}
