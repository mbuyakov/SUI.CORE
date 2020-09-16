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

if(process.cwd().includes('SUI.ALL')) {
  curPackageJson.peerDependencies = sortKeys(Object.assign(curPackageJson.peerDependencies, magicDeps.magic));
  curPackageJson.devDependencies = sortKeys(Object.assign(curPackageJson.devDependencies, magicDeps.magic));
} else {
  curPackageJson.dependencies = sortKeys(Object.assign(curPackageJson.dependencies, magicDeps.magic));
  curPackageJson.devDependencies = sortKeys(Object.assign(curPackageJson.devDependencies, magicDeps.dev));
}

fs.writeFile(curPackageJsonPath, JSON.stringify(curPackageJson, null, 2), 'utf8', function(err) {
  if (err) return console.log(err);
});
