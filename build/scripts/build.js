/**
 * Auth: lijiang
 * Date: 2018/2/11
 * Description: make
 */
const utils = require('./utils/utils');
// const lodash = require('lodash');

const ora = require('ora');
const spinner = ora('');
// 预处理过程
const publish = require('./publish/index');
const compile = require('./project/index');
// const rpc = require('./rpc/index');
// const csvParser = require('./csv/CsvParser');
//
// // fix rpc
// const fixRpx = require('./watcher/fixRpx');

let config = utils.loadConfigure();

const build = () => {
  spinner.start();

  // publish
  publish.publish(config, 'product');

  // compile
  compile.compile(config, 'product');

  setTimeout(() => {
    spinner.stop();
    utils.print('make project complete', 'yellow');
  }, 1000);
};

build();

