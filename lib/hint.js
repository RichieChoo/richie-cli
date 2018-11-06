const chalk = require('chalk');

const hint = {
  line: () => {
    console.info();
    console.info(chalk.gray('---------------------------------------'));
    console.info();
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
  docs: () => {
    console.info(chalk.green('别气啊，兄弟'));
  },
  issues: () => {
    console.info(chalk.green('别气啊，兄弟'));
  },
  fail: (spinner, str, err) => {
    spinner.fail([chalk.blue(str)]);
    console.info('');
    if(err) {
      console.error(err);
      console.info('')
    }
    console.info(chalk.blue('别气啊，兄弟'));
    process.exit()
  }
}

exports = module.exports = hint;