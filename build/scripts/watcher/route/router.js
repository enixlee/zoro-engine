/**
 * Auth: lijiang
 * Date: 2018/3/2
 * Description: route
 */
const watcher = require('chokidar');
const utils = require('../../utils/utils');
const spawn = require('child_process');

exports.watch = (config) => {
  let dir = `${config.PROJECT_PATH}/routes/router.js`;
  watcher.watch(dir)
    .on('change', routesChange);
};

function routesChange (path) {
  spawn.exec('npm run make -- app', () => {
    utils.print('app routes changed by routes changed!', 'magenta');
  });
}
