const fs = require('fs');

const magicDeps = require("./magic-deps.json");
const curPackageJsonPath = process.cwd() + "/package.json"
const curPackageJson = require(curPackageJsonPath);

const sortKeys = (unordered) => {
  const ordered = {};
  Object.keys(unordered).sort().forEach(function(key) {
    ordered[key] = unordered[key];
  });
  return ordered;
}

if(curPackageJson.name == "@sui/react") {
  curPackageJson.peerDependencies = sortKeys(Object.assign(curPackageJson.peerDependencies || {}, magicDeps.magic));
  curPackageJson.devDependencies = sortKeys(Object.assign(curPackageJson.devDependencies || {}, magicDeps.magic));
} else {
  curPackageJson.resolutions = sortKeys(Object.assign(curPackageJson.resolutions || {}, magicDeps.magic));
  curPackageJson.devDependencies = sortKeys(Object.assign(curPackageJson.devDependencies || {}, magicDeps.dev));
}

fs.writeFile(curPackageJsonPath, JSON.stringify(curPackageJson, null, 2) + '\n', 'utf8', function(err) {
  if (err) return console.log(err);
});
