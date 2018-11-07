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
const { exec } = require('child_process');
const spinner = new ora();




let answers_all = {};


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
        exec('ls',(error, stdout, stderr) => {
            if (error) {
                hint.fail(spinner, `自动更新失败，请手动更新到${version}版本`);
            }

            spinner.start("\n更新中"+"\n"+stdout);
            // spinner.stop("请重新");
            process.exit();
        });


    })
})
// commander init ( richie init )
    .then(function () {
        return new Promise(resolve => {
            if (commander.init) {
                inquirer.prompt([
                    question.name,
                    question.port,
                    question.richie_package_manager,
                    question.plugin
                ]).then(function (answers) {
                    answers_all.name = answers.name
                    answers_all.port = answers.port
                    answers_all.richie_package_manager = answers.richie_package_manager
                    answers_all.plugin = answers.plugin
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
                let _data = JSON.parse(data.toString())
                _data.name = answers_all.name
                _data.version = '0.0.0'
                _data.port = answers_all.port
                let str = JSON.stringify(_data, null, 4);
                // 写入
                fs.writeFile(`${process.cwd()}/${answers_all.name}/package.json`, str, function (err) {
                    if (!err) {
                        spinner.succeed(['项目结构生成完成！']);
                        spinner.clear();
                        resolve();
                    } else {
                        hint.fail(spinner, `package.json写入失败！`, err)
                    }
                })
            });
        })
    })
    // 安装项目依赖
    .then(function () {
        return new Promise((resolve, reject) => {
            let installStr = `正在使用${chalk.greenBright(answers_all.richie_package_manager)}安装依赖...`
            spinner.start([installStr])
            // 根据不同的选项选择安装方式
            let type_install = '';
            switch (answers_all.richie_package_manager) {
                case 'yarn':
                    type_install = 'yarn';
                    break;
                case 'cnpm':
                    type_install = 'cnpm install --no-optional';
                    break;
                default:
                    type_install = 'npm install --no-optional';
                    break;
            }
            cmdSystem([`cd ${answers_all.name}`, type_install], spinner, installStr)
                .then(() => {
                    spinner.succeed(['项目依赖安装完成.'])
                    spinner.clear()
                    resolve()
                })
        })
    })
    // 安装插件
    // 最后一步提示信息
    .then(function () {
        setTimeout(function () {
            hint.line()
            hint.print('green', `🎉  欢迎使用richie,请继续完成以下操作:`, 'bottom')
            hint.print('cyan', ` $ cd ${answers_all.name}`)
            hint.print('cyan', ` $ npm run dev`, 'bottom')
            hint.print('green', ` [使用手册] https://codexu.github.io/`)
            process.exit()
        }, 500)
    })