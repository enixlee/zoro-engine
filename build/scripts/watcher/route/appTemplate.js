const watcher = require('chokidar');
const utils = require('../../utils/utils');
const spawn = require('child_process');

exports.watch = (config) => {
  let dir = `${config.PROJECT_PATH}/app.template.wpy`;
  watcher.watch(dir)
    .on('change', routesChange);
};

function routesChange (path) {
  spawn.exec('npm run make -- app', () => {
    utils.print('app routes changed by app template changed!', 'magenta');
  });
}
