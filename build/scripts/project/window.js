/**
 * Auth: lijiang
 * Date: 2018/3/1
 * Description: window
 */
const yaml = require('js-yaml');
const utils = require('../utils/utils');
const fs = require('fs');
const lodash = require('lodash');

let windowConfigPath = `/config/window.yaml`;
let windowOutputPath = `/config/app/Window.js`;

exports.compile = (config) => {
  let projectPath = config['PROJECT_PATH'];
  let filePath = `${projectPath}${windowConfigPath}`;

  let content = fs.readFileSync(filePath, 'utf8');
  let windowConfig = yaml.safeLoad(content);

  let window = makeWindowParams(windowConfig);
  let outputPath = `${projectPath}${windowOutputPath}`;
  fs.writeFileSync(outputPath, window, 'utf8');

  utils.print('compile bala mini program window config complete!');
};

const makeWindowParams = (window) => {
  let keys = lodash.keys(window);
  let paramsCount = keys.length;
  let content = '';
  lodash.map(keys, function (v, k) {
    let tpl = windowPramsTemplate;
    tpl = tpl.replace(/{{key}}/g, v);
    tpl = tpl.replace(/{{value}}/g, utils.transferYamlValue(window[v]));
    content += `  ${tpl}`;
    if (paramsCount !== k + 1) {
      content += ',\n';
    }
  });
  return windowTemplate.replace(/{{content}}/g, content);
};

const windowTemplate = `module.exports = {
{{content}}
};
`;

const windowPramsTemplate = `{{key}}: {{value}}`;
