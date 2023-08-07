/* eslint-disable no-restricted-imports */
import {Node, ScriptKind, tsquery} from "@phenomnomnominal/tsquery";

export function astRemove(
  source: string,
  selector: string,
  additionalFilter: (node: Node) => boolean,
  removeBreakLineAtEnd: boolean
): string {
  const matches = tsquery.query(source, selector, ScriptKind.TSX);
  const filters = matches.map((node) => additionalFilter(node));
  const reversedMatches = matches.reverse();
  const reversedFilters = filters.reverse();
  let result = source;
  reversedFilters.forEach((filter, index) => {
    if (filter) {
      const match = reversedMatches[index];
      result = `${result.substring(0, match.getStart())}${result.substring(match.getEnd() + (removeBreakLineAtEnd ? 1 : 0))}`;
    }
  });
  return result;
}
