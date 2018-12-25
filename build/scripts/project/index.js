/**
 * Auth: lijiang
 * Date: 2018/3/1
 * Description: index
 */
const env = require('./env');
// const window = require('./window');
// const tabBar = require('./tabBar');
// const network = require('./network');
// const components = require('./components');
// const route = require('./route');

exports.compile = (config, type) => {
  switch (type) {
    case 'app':
      // route.compile(config);
      break;
    default:
      compileAll(config, type);
      break;
  }
};

const compileAll = (config, type) => {
  env.compile(config, type);
  // window.compile(config, type);
  // network.compile(config, type);
  // tabBar.compile(config, type);
  // components.compile(config, type);
  // route.compile(config, type);
};
