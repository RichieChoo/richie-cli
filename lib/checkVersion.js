const semver = require('semver')
const commander = require('commander');
const getVersion = require('./getVersion');
const chalk = require('chalk');
const hint = require('./hint');
const packageVersion = require('../package.json').version;
const ora = require('ora');
const spinner = new ora();
const autoUpdate = require('./autoUpdate');
function checkVersion() {
    return new Promise((resolve, reject) => {
        getVersion(`https://registry.npmjs.org/richie-cli/latest`)
            .then(version => {
                let isNew = semver.lte(version, packageVersion);
                if (isNew) {
                    resolve()
                } else {
                    //TODO 自动更新
                    // spinner.start('正在尝试自动更新richie-cli至最新版本');
                    reject(version)
                }
            })
    })
}

exports = module.exports = checkVersion;