const fs = require('fs');

const magicDeps = require("./magic-deps.json");
const curPackageJsonPath = process.cwd() + "/package.json"
const curPackageJson = require(curPackageJsonPath);

const sortKeys = (unordered) => {
  const ordered = {};
  Object.keys(unordered).sort().forEach(function (key) {
    ordered[key] = unordered[key];
  });
  return ordered;
}

if (curPackageJson.name === "@sui/react") {
  curPackageJson.peerDependencies = sortKeys(magicDeps.dependencies);
  curPackageJson.resolutions = sortKeys(Object.assign(curPackageJson.resolutions || {}, magicDeps.dependencies, magicDeps.resolution));
  curPackageJson.dependencies = sortKeys(Object.assign(curPackageJson.dependencies || {}, magicDeps.dependencies));
} else {
  curPackageJson.resolutions = sortKeys(Object.assign(curPackageJson.resolutions || {}, magicDeps.dependencies, magicDeps.resolution, magicDeps.umi));
  curPackageJson.devDependencies = sortKeys(Object.assign(curPackageJson.devDependencies || {}, magicDeps.umi));
}

fs.writeFile(curPackageJsonPath, JSON.stringify(curPackageJson, null, 2) + '\n', 'utf8', function (err) {
  if (err) return console.log(err);
});
