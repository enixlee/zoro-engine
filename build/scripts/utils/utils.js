/**
 * Auth: lijiang
 * Date: 2018/2/11
 * Description: utils
 */
const chalk = require('chalk');
const lodash = require('lodash');
const path = require('path');
const yamlParser = require('js-yaml');
const fs = require('fs');

/**
 * 打印
 * @param printInfo
 * @param color: red,green,yellow,blue,magenta,cyan,white,gray
 */
exports.print = (printInfo, color = 'cyan') => {
  let colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray'];
  if (!lodash.isString(color)) {
    color = 'cyan';
  } else {
    let difference = lodash.difference([color], colors);
    color = difference.length === 0 ? color : 'cyan';
  }
  console.log(chalk[color](printInfo));
};

/**
 * 加载配置文件
 * @returns {*}
 */
exports.loadConfigure = () => {
  let projectPath = path.resolve();
  let configure = projectPath + '/build/scripts/.config';
  let config = fs.readFileSync(configure, 'utf8');
  let configMap = yamlParser.safeLoad(config);
  configMap['PROJECT_PATH'] = projectPath;
  return configMap;
};

/**
 * 加载环境变量
 * @returns {*}
 */
exports.loadEnv = () => {
  let projectPath = path.resolve();
  let configure = projectPath + `/.env`;
  let config = fs.readFileSync(configure, 'utf8');
  return yamlParser.safeLoad(config);
};

/**
 * 格式化yaml数值
 * @param value
 * @returns {string}
 */
exports.transferYamlValue = (value) => {
  let newVal = '';
  if (lodash.isBoolean(value) || lodash.isNumber(value)) {
    newVal = value;
  } else {
    newVal = `'${value}'`;
  }

  return newVal;
};
