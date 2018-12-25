/**
 * Auth: lijiang
 * Date: 2018/3/5
 * Description: watchPages
 */
const watcher = require('chokidar');
const utils = require('../../utils/utils');
const spawn = require('child_process');

exports.watch = (config) => {
  // 为了解决npm run dev 后app.json被覆盖的bug
  let dir = `${config.PROJECT_PATH}/dist/pages/`;
  watcher.watch(dir)
    .on('add', routesChange)
    .on('change', routesChange)
    .on('addDir', routesChange);
};

function routesChange (path) {
  spawn.exec('npm run make -- app', () => {
    utils.print('app routes changed by pages changed!', 'blue');
  });
}
