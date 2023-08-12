import {DeclarationStatement} from "typescript";

export function parseCommonNamedNode(node: DeclarationStatement) {
  return node.name.text;
}
