// Don't touch. _chalk.default for real run, _chalk for jest
// eslint-disable-next-line no-restricted-imports
import * as _chalk from "chalk";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const chalk: import("chalk").Chalk = _chalk.default ?? _chalk;
