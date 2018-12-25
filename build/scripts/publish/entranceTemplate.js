/**
 * Auth: lijiang
 * Date: 2018/5/15
 * Description: IndexTemplate
 */
const yaml = require('js-yaml');
const utils = require('../utils/utils');
const fs = require('fs');

let envConfigPath = '/.env';
const versionPath = '/config/Version.yaml';
const template = '/index_template.html';
const output = '/index.html';

exports.compile = (config, envType) => {
  if (envType === 'product') {
    envConfigPath += '.product';
  }

  let projectPath = config['PROJECT_PATH'];
  let filePath = `${projectPath}${envConfigPath}`;
  let content = fs.readFileSync(filePath, 'utf8');
  let envConfig = yaml.safeLoad(content);

  let versionPathFull = `${projectPath}${versionPath}`;
  let version = fs.readFileSync(versionPathFull, 'utf8');
  let versionConfig = yaml.safeLoad(version);

  let index = `${projectPath}${template}`;
  let indexFile = fs.readFileSync(index, 'utf8');

  indexFile = indexFile.replace(/{{APP_NAME}}/g, envConfig.APP_NAME)
    .replace(/{{CDN_URL}}/g, envConfig.CDN_URL)
    .replace(/{{RES_VERSION}}/g, versionConfig.RES_VERSION.replace('PROJECT_NAME', envConfig.PROJECT_NAME));

  let outputPath = `${projectPath}${output}`;
  fs.writeFileSync(outputPath, indexFile, 'utf8');

  utils.print(`make index file complete!`);
};
