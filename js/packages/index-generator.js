const fs = require("fs");

fs.readdirSync(".").forEach(packageName => {
  if (fs.statSync(packageName).isDirectory()) {
    console.log(`Processing package ${packageName}`);
    recursiveProcess(`${packageName}/src`);
  }
});

function recursiveProcess(path) {
  console.log(`Processing path ${path}`);

  if (path === "react/src/SuiDatePicker" || path === "all/src") {
    console.warn(`Ignore ${path}`);
    return;
  }

  if (!fs.existsSync(path)) {
    console.warn(`${path} not exist`);
    return;
  }

  fs.readdirSync(path).forEach(item => {
    const pathWithItem = `${path}/${item}`;
    if (fs.statSync(pathWithItem).isDirectory()) {
      recursiveProcess(pathWithItem);
    }
  });

  generateIndex(path);
}

function generateIndex(path) {
  console.log(`Generating index for ${path}`);
  const pathWithIndex = `${path}/index.ts`;
  let hasSmthExcludeExpropts = false;

  if (fs.existsSync(pathWithIndex)) {
    fs.readFileSync(pathWithIndex).toString().split("\n").forEach(row => {
      if (!row.startsWith("export * from") && row.length) {
        hasSmthExcludeExpropts = true;
      }
    });
  }

  if (hasSmthExcludeExpropts) {
    console.warn(`File ${pathWithIndex} has something other than "export * from...". Ignore`);
    return;
  }

  const folders = fs.readdirSync(path)
    .filter(it => fs.statSync(`${path}/${it}`).isDirectory())
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  const files = fs.readdirSync(path)
    .filter(it => fs.statSync(`${path}/${it}`).isFile() && it !== "index.ts" && !it.endsWith(".test.ts"))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  let indexBody = "";

  if (folders.length) {
    folders.forEach(it => indexBody += `export * from "./${it}";\n`)
  }

  if (files.length) {
    if (folders.length) {
      indexBody += "\n";
    }
    files.forEach(it => indexBody += `export * from "./${it.split(".")[0]}";\n`)
  }

  fs.writeFileSync(pathWithIndex, indexBody);
}
