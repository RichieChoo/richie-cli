// 问题选择
const question = {
    name: {
        type: 'input',
        message: `项目名称: `,
        name: 'name',
        default: 'richie-template'
    },
    version: {
        type: 'input',
        message: `初始版本: `,
        name: 'version',
        default: '0.0.1'
    },
    port: {
        type: 'input',
        message: `默认端口: `,
        name: 'port',
        default: '8080'
    },
    package_manager: {
        type: 'list',
        message: `选择包管理器: `,
        name: 'package_manager',
        choices: ['yarn', 'npm', 'cnpm']
    }
}

exports = module.exports = question;