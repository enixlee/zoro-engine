/**
 * Auth: lijiang
 * Date: 2018/3/19
 * Description: components
 */
const yaml = require('js-yaml');
const utils = require('../utils/utils');
const fs = require('fs');
const lodash = require('lodash');

let componentsConfigPath = `/config/components.yaml`;
let componentsOutputPath = `/config/app/Components.js`;

exports.compile = (config) => {
  let projectPath = config['PROJECT_PATH'];
  let filePath = `${projectPath}${componentsConfigPath}`;

  let content = fs.readFileSync(filePath, 'utf8');
  let components = yaml.safeLoad(content);

  let componentsConfig = makeComponents(components);
  let outputPath = `${projectPath}${componentsOutputPath}`;
  fs.writeFileSync(outputPath, componentsConfig, 'utf8');

  utils.print('compile bala mini program ui components complete!');
};

const makeComponents = (components, prefix = 'module.exports = ') => {
  let contents = '';
  lodash.map(components, (componentsProject) => {
    let name = componentsProject.componentsProject;
    let rootPath = componentsProject.componentsRootPath;
    let list = componentsProject.list;
    lodash.map(list, (component) => {
      let cName = component.name;
      let root = component.root || cName;
      let path = component.path || 'dist/index';

      let c = componentsPramsTemplate.replace('{{key}}', cName).replace('{{value}}', rootPath + name + '/' + root + '/' + path);
      contents += `  ${c},\n`;
    });
  });
  let index = contents.lastIndexOf(',\n');
  contents = contents.substring(0, index);
  return componentsTemplate.replace(/{{content}}/g, contents).replace(/{{prefix}}/g, prefix);
};

const componentsTemplate = `{{prefix}}{
{{content}}
};`;

const componentsPramsTemplate = `'{{key}}': '{{value}}'`;
