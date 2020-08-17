const fs = require('fs');

const magicDeps = require("./magic-deps.json");
const curPackageJsonPath = process.cwd() + "/package.json"
const curPackageJson = require(curPackageJsonPath);

if(process.env.SUI) {
  curPackageJson.peerDependencies = Object.assign(curPackageJson.peerDependencies, magicDeps);
  curPackageJson.devDependencies = Object.assign(curPackageJson.devDependencies, magicDeps);
} else {
  curPackageJson.dependencies = Object.assign(curPackageJson.dependencies, magicDeps);
}

fs.writeFile(curPackageJsonPath, JSON.stringify(curPackageJson, null, 2), 'utf8', function(err) {
  if (err) return console.log(err);
});
