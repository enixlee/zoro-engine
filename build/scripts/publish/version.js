/**
 * Auth: lijiang
 * Date: 2018/2/11
 * Description: config
 */
const yaml = require('js-yaml');
const fs = require('fs');
const lodash = require('lodash');
const utils = require('../utils/utils');

let appVersionFile = '/config/Version.yaml';
let versionPublishPath = `/src/config/Version.js`;

exports.publish = (config) => {
  let versionFile = `${config['PROJECT_PATH']}${appVersionFile}`;

  let content = fs.readFileSync(versionFile, 'utf8');
  let versionObj = yaml.safeLoad(content);

  let versions = buildVersion(config, versionObj);

  let publishPath = `${config['PROJECT_PATH']}${versionPublishPath}`;
  fs.writeFileSync(publishPath, versions, 'utf8');

  utils.print(`make app version complete!`);
};

const buildVersion = (config, versionDict) => {
  let versionJs = '';
  lodash.map(versionDict, function (v, k) {
    let value = '';
    if (!lodash.isBoolean(v)) {
      value = `'${v}'`.replace(/PROJECT_NAME/g, config['PROJECT_NAME']);
    } else {
      value = v;
    }
    versionJs += `export const ${k} = ${value};\n`;
  });

  return versionJs;
};
