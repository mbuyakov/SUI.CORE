import {createPrinter, EmitHint, NewLineKind, Node} from "typescript";

export const printer = createPrinter({
  newLine: NewLineKind.LineFeed,
});

export function printNode(node: Node) {
  return printer.printNode(EmitHint.Unspecified, node, node.getSourceFile());
}

export const mapModules = {
  "@material-ui/core": "@sui/deps-material",
  "@mui/material": "@sui/deps-material",
  "antd": "@sui/deps-antd",
  "typescript-ioc": "@sui/deps-ioc",
  "@sui/amcharts": "@sui/deps-amcharts",
  "react-router": "@sui/deps-router",
  "react-router-dom": "@sui/deps-router",
};
