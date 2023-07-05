import {createPrinter, EmitHint, NewLineKind, Node} from "typescript";

// Don't touch. _chalk.default for real run, _chalk for jest
import * as _chalk from "chalk";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const chalk: import("chalk").Chalk = _chalk.default ?? _chalk;

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

export function logRemap(prefix: string, text: string) {
  prefix = " " + prefix + " ";
  prefix = chalk.cyan(prefix);
  prefix = chalk.bold(prefix);
  prefix = chalk.inverse(prefix);
  text = chalk.yellow(text);
  text = chalk.bold(text);
  console.log(prefix + " " + text);
}
