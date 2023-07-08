/* eslint-disable no-console */
import ora, {Ora} from "ora";
import logSymbols from "log-symbols";
import stripAnsi from "strip-ansi";
import isUnicodeSupported from "is-unicode-supported";
import {chalk} from "./chalk";

export {logSymbols as logSymbols};

let spinner: Ora | undefined;
let lastLoggedPrefix: string | undefined;
let lastLoggedText: string | undefined;
let prevPrefixHasExtendedLog = false;
function replaceToUtf(text: string) {
  if (isUnicodeSupported()) {
    text = text
      .replace(/\/-/g, "┏ ")
      .replace(/\\-/g, "┗ ")
      .replace(/\|-/g, "┣━")
      .replace(/\|/g, "┃")
      .replace(/-/g, "━");
  }
  return text;
}

export function setSpinnerPrefix(prefix: string) {
  if (!spinner) {
    spinner = ora().start();
  }
  spinner.prefixText = prefix;
  spinner.render();
}

export function setSpinnerText(text: string) {
  text = chalk.dim(text);
  if (!spinner) {
    spinner = ora().start();
  }
  spinner.text = text;
  spinner.render();
}

export function stopSpinner(text = "Done") {
  if (lastLoggedPrefix == spinner.prefixText) {
    spinner.prefixText = replaceToUtf("\\-");
    prevPrefixHasExtendedLog = true;
  } else {
    prevPrefixHasExtendedLog = false;
  }

  spinner?.succeed(text);
  spinner = null;
  lastLoggedText = null;
  lastLoggedPrefix = null;
}

export function logWithPrefix(prefix: string, text: string, level: string = logSymbols.info) {
  text = `${level} ${chalk.dim(prefix)} ${text}`;
  if (spinner?.isSpinning) {
    spinner.stop();

    if (lastLoggedPrefix != spinner.prefixText) {
      lastLoggedPrefix = spinner.prefixText as string;
      if (prevPrefixHasExtendedLog) {
        console.log("");
      }
      console.log(`${replaceToUtf("/-")}${chalk.bold(stripAnsi(spinner.prefixText as string))}`);
    }

    if (lastLoggedText != spinner.text) {
      lastLoggedText = spinner.text;
      console.log(`${replaceToUtf("|-")} ${stripAnsi(spinner.text)}`);
    }

    console.log(`${replaceToUtf("|")}    ${text}`);
    spinner.start();
  } else {
    console.log(text);
  }
}
