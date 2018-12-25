/**
 * Auth: lijiang
 * Date: 2018/2/11
 * Description: index
 */
const rpxWatcher = require('./rpx');
const utils = require('../utils/utils');
const routeCompiler = require('./route/index');

function run (cmd) {
  let config = utils.loadConfigure();
  rpxWatcher.watch(config);
  routeCompiler.compile(config);
}

run();
