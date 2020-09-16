const clipboardy = require('clipboardy');
const fs = require('fs');
const publish = require('./publish');


const date = new Date();
const dateStr =
  date.getFullYear() +
  ("00" + (date.getMonth() + 1)).slice(-2) +
  ("00" + date.getDate()).slice(-2) +
  ("00" + date.getHours()).slice(-2) +
  ("00" + date.getMinutes()).slice(-2) +
  ("00" + date.getSeconds()).slice(-2);

const version = `8.0.${dateStr}-canary`;

const restoreLerna = () => fs.renameSync(`./lerna-bkp.json`, `./lerna.json`);

fs.copyFileSync(`./lerna.json`, `./lerna-bkp.json`);
process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  restoreLerna();
});

try {
  publish(version);
} catch (e) {
  restoreLerna();
  process.exit(1);
}
restoreLerna();
console.log("Successfully!");

const command = `yarn add @sui/all@${version}`;
clipboardy.writeSync(command);
console.log(`To install: ${command} (already copied to you clipboard)`);
