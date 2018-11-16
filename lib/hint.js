const chalk = require('chalk');

const hint = {
  line: () => {
    console.info(chalk.gray('----☯-------卍--------✝---------☠-------✡----'));
  },
  print: (color, text, br) => {
    if(br === 'top') {
      console.info();
    }
    console.info(chalk[color](text));
    if(br === 'bottom') {
      console.info();
    }
  },

  fail: (spinner, str, err) => {
    spinner.fail([chalk.red(str)]);
    console.info('');
    if(err) {
      console.error(err);
      console.info('')
    }
    process.exit()
  }
}

exports = module.exports = hint;