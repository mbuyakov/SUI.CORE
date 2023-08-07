import {createPrinter, EmitHint, isImportDeclaration, NewLineKind, Node} from "typescript";

const printer = createPrinter({
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

export function printNodes(nodes: Node[]) {
  return nodes
    .map(it => printNode(it))
    .join("\n");
}
