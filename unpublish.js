const packagejson = require('./package.json');
const spawn = require('child_process').spawn;

spawn('npm', ['unpublish', `${packagejson.name}@${packagejson.version}`], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
});