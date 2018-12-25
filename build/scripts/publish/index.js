/**
 * Auth: lijiang
 * Date: 2018/2/11
 * Description: index
 */
const version = require('./version');
const index = require('./entranceTemplate');

exports.publish = (config, envType) => {
  version.publish(config, envType);
  index.compile(config, envType);
};
