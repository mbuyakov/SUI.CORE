// Export ... was in found '@sui/all'
// https://github.com/babel/babel/issues/8361
const fs = require("fs");
const tsConfig = require(`./packages/${process.env.PACKAGE}/tsconfig.json`);


recursiveProcess(`./packages/${process.env.PACKAGE}/${tsConfig.compilerOptions.outDir}`);

function recursiveProcess(path) {
  console.log(`Processing path ${path}`);

  if (!fs.existsSync(path)) {
    throw new Error(`${path} not exist`);
  }

  fs.readdirSync(path).forEach(item => {
    const pathWithItem = `${path}/${item}`;
    const stat = fs.statSync(pathWithItem);
    if (stat.isDirectory()) {
      recursiveProcess(pathWithItem);
    }
    if (stat.isFile()) {
      fix(pathWithItem);
    }
  });
}

function fix(path) {
  if (fs.readFileSync(path).toString() === "export {};") {
    console.log(`Fix file ${path}`);
    fs.writeFileSync(path, "");
  }
}
