/**
 * Auth: lijiang
 * Date: 2018/3/1
 * Description: tabBar
 */
const yaml = require('js-yaml');
const utils = require('../utils/utils');
const fs = require('fs');
const lodash = require('lodash');

let tabBarConfigPath = `/config/tabBar.yaml`;
let tabBarOutputPath = `/config/app/TabBar.js`;

exports.compile = (config) => {
  let projectPath = config['PROJECT_PATH'];
  let filePath = `${projectPath}${tabBarConfigPath}`;

  let content = fs.readFileSync(filePath, 'utf8');
  let tabConfig = yaml.safeLoad(content);

  let tab = makeTabBar(tabConfig);
  let outputPath = `${projectPath}${tabBarOutputPath}`;
  fs.writeFileSync(outputPath, tab, 'utf8');

  utils.print('compile bala mini program TabBar config complete!');
};

const makeTabBar = (tab) => {
  let content = '';
  let listKey = 'list';
  lodash.map(tab, function (v, k) {
    if (k !== listKey) {
      let tpl = tabBarPramsTemplate;
      tpl = tpl.replace(/{{key}}/g, k);
      tpl = tpl.replace(/{{value}}/g, utils.transferYamlValue(v));
      content += `  ${tpl},\n`;
    }
  });
  let tabs = tab[listKey];
  let list = tabs.length > 0 ? makeTabList(tabs) : '';

  return tabBarTemplate.replace(/{{content}}/g, content).replace(/{{list}}/g, list);
};

const makeTabList = (tabs) => {
  let list = '';
  lodash.map(tabs, function (tabItem, index) {
    let keys = lodash.keys(tabItem);
    let paramsCount = keys.length;
    let last = paramsCount - 1;
    let itemTpl = listItemTemplate;
    let listItem = '';
    lodash.map(keys, function (v, k) {
      let tpl = tabBarPramsTemplate;
      tpl = tpl.replace(/{{key}}/g, v);
      tpl = tpl.replace(/{{value}}/g, utils.transferYamlValue(tabItem[v]));
      let prefix = k === 0 ? '\n      ' : '      ';
      if (k !== last) {
        listItem += `${prefix}${tpl},\n`;
      } else {
        listItem += `${prefix}${tpl}\n`;
      }
    });

    itemTpl = itemTpl.replace(/{{listItem}}/g, listItem);
    if (index !== tabs.length - 1) {
      list += `${itemTpl},  `;
    } else {
      list += `${itemTpl}\n  `;
    }
  });

  return list;
};

const tabBarTemplate = `module.exports = {
{{content}}  list: [{{list}}]
};
`;

const tabBarPramsTemplate = `{{key}}: {{value}}`;

const listItemTemplate = `
    {{{listItem}}    }`;
