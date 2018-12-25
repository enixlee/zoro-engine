/**
 * Auth: lijiang
 * Date: 2018/3/5
 * Description: route
 */
const fs = require('fs');
const _ = require('lodash');
const AppConfig = require('../../config/app/App');
const router = require('../../routes/router');
const utils = require('../utils/utils');

exports.compile = (config) => {
  let appJsonFile = `${config.PROJECT_PATH}/dist/app.json`;
  let newFile = JSON.stringify(AppConfig);
  if (fs.existsSync(appJsonFile)) {
    fs.writeFileSync(appJsonFile, newFile, 'utf8');
  }

  let appTemplatePath = `${config.PROJECT_PATH}/app.template.wpy`;
  let appJs = fs.readFileSync(appTemplatePath, 'utf8');
  newFile = formatAppConfig(AppConfig);
  appJs = appJs.replace(/'AppConfig'/g, newFile);
  let appWpy = `${config.PROJECT_PATH}/src/app.wpy`;
  fs.writeFileSync(appWpy, appJs, 'utf8');

  let routeConfig = `${config.PROJECT_PATH}/src/config/Routes.js`;
  let tpl = `export default {{routes}};`;
  let routes = router.routes();
  let rootPages = routes.pages;
  let subPackages = router.subPackages();

  let pages = {};
  rootPages.forEach((v) => {
    pages[v] = 1;
  });
  _.map(subPackages, (v, k) => {
    pages[k] = v;
  });

  tpl = tpl.replace(/{{routes}}/g, JSON.stringify(pages)).replace(/"/g, `'`);
  fs.writeFileSync(routeConfig, tpl + '\n', 'utf8');

  utils.print('app.json and app.js compiled!', 'red');
};

const formatAppConfig = (AppConfig) => {
  return printDict(AppConfig, 0);
};

let baseTab = '      ';

const calTab = (level) => {
  let levelTab = '';
  for (let i = 0; i < level; i++) {
    levelTab += '  ';
  }

  let lastTab = '';
  for (let i = 0; i < level - 1; i++) {
    lastTab += '  ';
  }

  return [levelTab, lastTab];
};

const printDict = (dict, level) => {
  let content = '';
  let [levelTab, lastTab] = calTab(level);
  let length = _.keys(dict).length;
  let count = 0;
  _.map(dict, function (v, k) {
    let suffix = ',\n';
    count++;
    if (count === length) {
      suffix = '';
    }
    if (_.isString(v)) {
      content += `${baseTab}${levelTab}'${k}': '${v}'${suffix}`;
    } else if (_.isArray(v)) {
      let array = printArray(v, level + 1);
      content += `${baseTab}${levelTab}'${k}': ${array}${suffix}`;
    } else if (_.isObject(v)) {
      let obj = printDict(v, level + 1);
      content += `${baseTab}${levelTab}'${k}': ${obj}${suffix}`;
    } else if (_.isNumber(v) || _.isBoolean(v)) {
      content += `${baseTab}${levelTab}'${k}': ${v}${suffix}`;
    }
  });

  let suffix = '    ';
  if (level > 0) {
    suffix = `${baseTab}${lastTab}`;
  }

  return `{\n${content}\n${suffix}}`;
};

const printArray = (arr, level) => {
  let content = '';
  let [levelTab, lastTab] = calTab(level);
  _.map(arr, function (v, k) {
    let suffix = ',\n';
    if (k === arr.length - 1) {
      suffix = '';
    }
    if (_.isString(v)) {
      content += `${baseTab}${levelTab}'${v}'${suffix}`;
    } else if (_.isArray(v)) {
      let array = printArray(v, level + 1);
      content += `${baseTab}${levelTab}${array}${suffix}`;
    } else if (_.isObject(v)) {
      let obj = printDict(v, level + 1);
      content += `${baseTab}${levelTab}${obj}${suffix}`;
    } else if (_.isNumber(v) || _.isBoolean(v)) {
      content += `${baseTab}${levelTab}${v}${suffix}`;
    }
  });

  return `[\n${content}\n${baseTab}${lastTab}]`;
};
