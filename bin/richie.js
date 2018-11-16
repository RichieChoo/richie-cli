#!/usr/bin/env node

const fs = require('fs');

const commander = require('commander');
const inquirer = require('inquirer')
const download = require('download-git-repo');
const chalk = require('chalk');
const ora = require('ora');

const richie_package = require('../package.json');
const question = require('../lib/question.js');
const hint = require('../lib/hint.js');
const clearConsole = require('../lib/clearConsole');
const checkVersion = require('../lib/checkVersion');
const cmdSystem = require('../lib/cmdSystem');
const spinner = new ora();




let answers_all = {};

// 必须在.parse()之前，因为node的emit()是即时的
commander
    .version(richie_package.version)
    .option('-i, init', '初始化richie项目');

commander
    .parse(process.argv);

new Promise(function (resolve, reject) {
    // 清空控制台，并输出版本信息
    clearConsole('magenta', `RICHIE-CLI v${richie_package.version}`);
    console.info('');
    // 检测是否为最新版本
    spinner.start('正在查询richie-cli最新版本');
    checkVersion().then(() => {
        spinner.stop();
        resolve()
    }, (version) => {
        hint.fail(spinner, `自动更新失败，请手动更新到${version}版本`);
        spinner.start("\n更新中"+"\n"+stdout);
        // spinner.stop("请重新");
        process.exit();


    })
})
// commander init ( richie init )
    .then(function () {
        return new Promise(resolve => {
            if (commander.init) {
                inquirer.prompt([
                    question.name,
                    question.version,
                    question.port,
                    question.package_manager,
                ]).then(function (answers) {
                    answers_all.name = answers.name;
                    answers_all.version = answers.version;
                    answers_all.port = answers.port;
                    answers_all.package_manager = answers.package_manager;
                    resolve();
                });
            }
        })
    })
    // 通过download-git-repo下载richie
    .then(function () {
        hint.line()
        spinner.start('正在生成...');
        return new Promise(resolve => {
            download('RichieChoo/react-project', answers_all.name, function (err) {
                if (!err) {
                    resolve()
                } else {
                    hint.fail(spinner, '生成失败！请检查网络链接状况', err)
                }
            })
        })
    })
    // 修改package.json
    .then(function () {
        return new Promise((resolve, reject) => {
            // 读取package.json
            fs.readFile(`${process.cwd()}/${answers_all.name}/package.json`, (err, data) => {
                if (err) {
                    hint.fail(spinner, `package.json读取失败！`, err)
                }
                let _data = JSON.parse(data.toString());
                _data.name = answers_all.name;
                _data.version = answers_all.version;
                _data.scripts.start = "cross-env APP_TYPE=site umi dev --port=9"+answers_all.port;
                let str = JSON.stringify(_data, null, 4);
                // 写入
                fs.writeFile(`${process.cwd()}/${answers_all.name}/package.json`, str, function (err) {
                    if (!err) {
                        spinner.succeed(['项目结构生成完成！']);
                        spinner.clear();
                        resolve();
                    } else {
                        hint.fail(spinner, `package.json写入失败！`, err);
                    }
                })
            });
        })
    })
    // 安装项目依赖
    .then(function () {
        return new Promise((resolve, reject) => {
            let installStr = `正在使用 ${chalk.magenta(answers_all.package_manager)} 安装依赖...`;
            spinner.start([installStr]);
            // 根据不同的选项选择安装方式
            let type_install = '';
            switch (answers_all.package_manager) {
                case 'cnpm':
                    type_install = 'cnpm install --no-optional';
                    break;
                default:
                    type_install = 'npm install --no-optional';
                    break;
            }
            cmdSystem([`cd ${answers_all.name}`, type_install], spinner, installStr)
                .then(() => {
                    spinner.succeed(['项目依赖安装完成!']);
                    spinner.clear();
                    resolve()
                })
        })
    })
    // 安装插件
    // 最后一步提示信息
    .then(function () {
        setTimeout(function () {
            hint.line()
            hint.print('magenta', `🎉🎉🎉  欢迎使用richie-cli,你可以☟:`, 'bottom');
            hint.print('cyan', ` $ cd ${answers_all.name}`);
            hint.print('cyan', ` $ npm start`, 'bottom');
            process.exit()
        }, 500)
    })