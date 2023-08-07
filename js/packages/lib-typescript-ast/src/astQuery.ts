/* eslint-disable no-restricted-imports */
import {Node, ScriptKind, tsquery} from "@phenomnomnominal/tsquery";

export function astQuery<T extends Node = Node>(source: string, selector: string): T[] {
  return tsquery.query<T>(source, selector, ScriptKind.TSX);
}
