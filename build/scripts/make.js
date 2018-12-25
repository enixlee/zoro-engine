/**
 * Auth: lijiang
 * Date: 2018/2/11
 * Description: make
 */
const utils = require('./utils/utils');
const lodash = require('lodash');

const ora = require('ora');
const spinner = ora('');
// 预处理过程
const publish = require('./publish/index');
const compile = require('./project/index');
const rpc = require('./rpc/index');
const csvParser = require('./csv/CsvParser');

let config = utils.loadConfigure();

const make = () => {
  let argv = process.argv;
  let singleCompile = lodash.isString(argv[2]);

  spinner.start();
  if (singleCompile) {
    doCompile(argv[2]);
  } else {
    utils.print('begin make project', 'yellow');

    // publish
    publish.publish(config);

    // compile
    compile.compile(config);

    // rpc
    // rpc.compile(config);

    // csv
    // csvParser.parse(config);
  }

  setTimeout(() => {
    spinner.stop();
    utils.print('make project complete', 'yellow');
  }, 1000);
};

const doCompile = (cmd) => {
  switch (cmd) {
    case 'app':
      compile.compile(config, cmd);
      break;
    case 'rpc':
      rpc.compile(config);
      break;
    case 'csv':
      csvParser.parse(config);
      break;
    default:
      break;
  }
};

make();
