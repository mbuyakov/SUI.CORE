const packagejson = require('./package.json');
const spawn = require('child_process').spawn;

spawn('npm', ['unpublish', `${packagejson.name}@${packagejson.version}`, "--registry http://verdaccio.smp.cloudcom.ru/"], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
});
