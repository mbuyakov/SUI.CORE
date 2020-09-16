const fs = require('fs');
const {execSync} = require('child_process');

const packages = [
  "test",
  "linter",
  "core",
  "all"
]

const bkpPackageJson = () => {
  console.log(`====\r\nCreate backup of package.json\r\n====`);
  packages.forEach(pkg => {
    fs.copyFileSync(`./packages/${pkg}/package.json`, `./packages/${pkg}/package-bkp.json`)
  });
}
const restorePackageJson = () => {
  console.log(`====\r\nRestore backup of package.json\r\n====`);
  packages.forEach(pkg => {
    fs.renameSync(`./packages/${pkg}/package-bkp.json`, `./packages/${pkg}/package.json`)
  });
}

function publish(version) {
  bkpPackageJson();

  process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    restorePackageJson();
  });

  try {
    console.log(`====\r\nUpdate version\r\n====`);
    execSync(`npx lerna version ${version} --no-git-tag-version --no-push --yes`, {
      stdio: "inherit"
    });
    packages.forEach(pkg => {
      console.log(`====\r\nPublishing ${pkg}\r\n====`);
        execSync(`yarn publish --registry http://verdaccio.smp.cloudcom.ru/ --non-interactive --no-git-tag-version --new-version ${version}`, {
          stdio: "inherit",
          cwd: `${process.cwd()}/packages/${pkg}`
        });
      })
  }catch (e) {
    console.error(`====\r\nSOMETHING GOES WRONG\r\n====`);
    restorePackageJson();
    console.error(`====\r\nTRACE\r\n====`);
    throw e;
  }

  restorePackageJson();
}

if (process.argv.length > 2) {
  const version = process.argv[2];
  publish(version);
}

module.exports = publish;
