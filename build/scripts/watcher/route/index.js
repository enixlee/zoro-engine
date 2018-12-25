/**
 * Auth: lijiang
 * Date: 2018/3/5
 * Description: index
 */
const routerWatcher = require('./router');
const pagesWatcher = require('./watchPages');
const appTemplateWatcher = require('./appTemplate');

exports.compile = (config) => {
  routerWatcher.watch(config);
  pagesWatcher.watch(config);
  appTemplateWatcher.watch(config);
};
