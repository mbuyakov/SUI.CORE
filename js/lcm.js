// LifeCycleManager
const child_process = require("child_process");
const fs = require("fs");

// console.log(process.cwd());
// console.log(process.argv);

const command = process.argv[2];
const curPackage = process.cwd().split("/").pop();
const hasEslintConfig = fs.existsSync(`${process.cwd()}/.eslintrc.js`);

console.log(`Command: ${command}`);
console.log(`Package: ${curPackage}`);
console.log(`Has EsLint config: ${hasEslintConfig}`);

function throwAndExit(msg) {
  console.error(msg);
  process.exit(1);
}

function wrapSpawn(prefix, spawnedProcess) {
  return new Promise(resolve => {
    const stdOutPrefix = `${prefix} stdout:`;
    const stdErrPrefix = `${prefix} stderr:`;

    spawnedProcess.stdout.on('data', (data) => {
      data.toString().replace(/\n$/, "").split("\n").forEach(line => console.log(stdOutPrefix, line));
    });

    spawnedProcess.stderr.on('data', (data) => {
      data.toString().replace(/\n$/, "").split("\n").forEach(line => console.log(stdErrPrefix, line));
    });

    spawnedProcess.on('close', resolve);
  });
}

//TODO FIX=1 && TIMING=1 && --watch
function lint() {
  return new Promise((resolve, reject) => {
    const spawnedProcess = child_process.spawn("sui-linter", {
      env: {
        FORCE_COLOR: '1',
        ROOT_DIR: "src",
        ...process.env
      },
      cwd: process.cwd()
    });

    wrapSpawn("lint", spawnedProcess).then(code => {
      console.log(`Lint ended with exit code ${code}`);
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
}

function fatherBuild() {
  return new Promise((resolve, reject) => {
    const spawnedProcess = child_process.spawn("father-build", {
      env: {
        FORCE_COLOR: '1',
        PACKAGE: curPackage,
        ...process.env
      },
      cwd: `${process.cwd()}/../..`
    });

    wrapSpawn("father-build", spawnedProcess).then(code => {
      console.log(`father-build ended with exit code ${code}`);
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
}

function tscAlias() {
  return new Promise((resolve, reject) => {
    const spawnedProcess = child_process.spawn("tsc-alias", ["-p", "tsconfig.json"], {
      cwd: process.cwd()
    });

    wrapSpawn("tsc-alias", spawnedProcess).then(code => {
      console.log(`tsc-alias ended with exit code ${code}`);
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
}

// Export ... was in found '@sui/all'
// https://github.com/babel/babel/issues/8361
function fixBabelWarning(path) {
  if (!path) {
    path = `${process.cwd()}/es`
  }
  const stat = fs.statSync(path);
  if (stat.isDirectory()) {
    fs.readdirSync(path).forEach(item => {
      fixBabelWarning(`${path}/${item}`);
    });
  } else if (stat.isFile()) {
    if (fs.readFileSync(path).toString() === "export {};") {
      console.log(`fix-babel-warning stdout: Fix file ${path}`);
      fs.writeFileSync(path, "");
    }
  }
}


function build() {
  return fatherBuild()
    .then(tscAlias)
    .then(fixBabelWarning);
}


(function main() {
  let commandPromise = null;
  switch (command) {
    case "ci":
      if (hasEslintConfig) {
        commandPromise = lint().then(build);
      } else {
        commandPromise = build();
      }
      // const promises = [];
      // if (hasEslintConfig) {
      //   promises.push(lint());
      // }
      // promises.push(build());
      // commandPromise = Promise.all(promises);
      break;
    case "lint":
      if (!hasEslintConfig) {
        throwAndExit("Can't run lint without .eslintrc.js");
      }
      commandPromise = lint();
      break;
    case "build":
      commandPromise = build();
      break;
    default:
      throwAndExit("Unknown command");
  }

  // noinspection JSObjectNullOrUndefined
  commandPromise
    .then(() => console.log("Done"))
    .catch(() => throwAndExit("Failed"));
})()
