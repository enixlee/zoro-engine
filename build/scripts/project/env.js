/**
 * Auth: lijiang
 * Date: 2018/3/2
 * Description: env
 */
const yaml = require('js-yaml');
const utils = require('../utils/utils');
const fs = require('fs');
const lodash = require('lodash');

let envConfigPath = '/.env';
// let envOutputPath = `/config/app/Env.js`;
let envPublishPath = `/src/config/Env.js`;

exports.compile = (config, envType) => {
  if (envType === 'product') {
    envConfigPath += '.product';
  }

  let projectPath = config['PROJECT_PATH'];
  let filePath = `${projectPath}${envConfigPath}`;

  let content = fs.readFileSync(filePath, 'utf8');
  let envConfig = yaml.safeLoad(content);

  // let env = makeEnvParams(envConfig);
  // let outputPath = `${projectPath}${envOutputPath}`;
  // fs.writeFileSync(outputPath, env, 'utf8');

  // utils.print('compile bala mini program env config complete!');

  let envApp = buildEnv(envConfig);

  let publishPath = `${config['PROJECT_PATH']}${envPublishPath}`;
  fs.writeFileSync(publishPath, envApp, 'utf8');

  utils.print(`make app env complete!`);
};


const buildEnv = (envDict) => {
  let env = '';
  lodash.map(envDict, function (v, k) {
    let value = '';
    if (!lodash.isBoolean(v)) {
      value = `'${v}'`;
    } else {
      value = v;
    }
    env += `export const ${k} = ${value};\n`;
  });

  return env;
};

const makeEnvParams = (env) => {
  let keys = lodash.keys(env);
  let paramsCount = keys.length;
  let content = '';
  lodash.map(keys, function (v, k) {
    let tpl = envPramsTemplate;
    tpl = tpl.replace(/{{key}}/g, v);
    tpl = tpl.replace(/{{value}}/g, utils.transferYamlValue(env[v]));
    content += `  ${tpl}`;
    if (paramsCount !== k + 1) {
      content += ',\n';
    }
  });
  return envTemplate.replace(/{{content}}/g, content);
};

const envTemplate = `module.exports = {
{{content}}
};
`;

const envPramsTemplate = `{{key}}: {{value}}`;
