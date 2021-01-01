import {globalPublish} from "./globalPublish";
import {getAllPackages} from "../../utils";
import {runCommandForAllPackages} from "../../commandRunner";
const clipboardy = require('clipboardy');
const notifier = require('node-notifier');
const chalk = require(`${__dirname}/../../../node_modules/chalk`);


export async function globalCanary(): Promise<void> {
  const packages = getAllPackages();
  for (const it of packages) {
    await runCommandForAllPackages("ci");
  }
  const date = new Date();
  const dateStr =
    date.getFullYear() +
    ("00" + (date.getMonth() + 1)).slice(-2) +
    ("00" + date.getDate()).slice(-2) +
    ("00" + date.getHours()).slice(-2) +
    ("00" + date.getMinutes()).slice(-2) +
    ("00" + date.getSeconds()).slice(-2);

  const version = `9.0.${dateStr}-canary`;
  await globalPublish(version);
  const command = `yarn add @sui/all@${version}`;
  clipboardy.writeSync(command);
  console.log(chalk.yellow(`To install: ${command} (already copied to you clipboard)`));
  notifier.notify({
    title: "SUI canary build done",
    message: "Command to install already copied to you clipboard"
  });
}
