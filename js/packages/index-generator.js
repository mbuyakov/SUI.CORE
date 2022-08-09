const fs = require("fs");

const naturalSorter = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase());
const isDirectory = it => fs.statSync(it).isDirectory();
const isFile = it => fs.statSync(it).isFile();

fs.readdirSync(".").forEach(packageName => {
  if (fs.statSync(packageName).isDirectory()) {
    console.log(`Processing package ${packageName}`);
    recursiveProcess(`${packageName}/src`);
  }
});

async function recursiveProcess(path) {
  console.log(`Processing path ${path}`);

  await Promise.all(fs.readdirSync(path)
    .map(item => `${path}/${item}`)
    .filter(isDirectory)
    .map(recursiveProcess));

  generateIndex(path);
}

function generateIndex(path) {
  console.log(`Generating index for ${path}`);

  const indexFilePath = `${path}/index.ts`;
  if (fs.existsSync(indexFilePath)) {
    const isCustom = fs.readFileSync(indexFilePath)
      .toString()
      .split("\n")
      .some(row => !row.startsWith("export * from") && row.length);

    if (isCustom) {
      console.warn(`File ${indexFilePath} has something other than "export * from...". Ignore`);
      return;
    }
  }

  const allContent = fs.readdirSync(path);

  const folders = allContent
    .filter(it => isDirectory(`${path}/${it}`))
    .sort(naturalSorter);

  const files = allContent
    .filter(it => isFile(`${path}/${it}`) && it !== "index.ts" && !it.endsWith(".test.ts") && !it.endsWith(".less"))
    .sort(naturalSorter);

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

  if (indexBody.length) {
    fs.writeFileSync(indexFilePath, indexBody);
  }
}
