/**
 * Auth: lijiang
 * Date: 2018/3/15
 * Description: error
 */
const path = require('path');
const fs = require('fs');
const lodash = require('lodash');

let template = null;
const projectPath = path.resolve();

exports.compile = (fileName, savePath, rpcSaveRelativePath, yaml) => {
  if (!lodash.isObject(yaml.options)) {
    return null;
  }

  if (parseInt(yaml.options.openApi) !== 1) {
    return null;
  }

  let apiName = `Rpc${fileName}`;
  let errorFileName = `Error${fileName}`;

  if (template === null) {
    template = fs.readFileSync(projectPath + '/build/scripts/rpc/template/Error', 'utf8');
  }

  let date = (new Date()).toLocaleString();
  let error = template.replace(/{{Date}}/g, date);
  error = error.replace(/{{rpcDesc}}/g, yaml.description || apiName);
  error = error.replace(/{{rpcName}}/g, apiName);
  error = error.replace(/{{rpcTemplatePath}}/g, rpcSaveRelativePath);
  error = error.replace(/{{fileName}}/g, errorFileName);

  let errorCodes = yaml.errorCodes;
  if (!lodash.isArray(errorCodes)) {
    return null;
  }

  let comments = makeComments(errorCodes);
  error = error.replace(/{{errorCodes}}/g, comments);
  fs.writeFileSync(savePath + errorFileName + '.js', error, 'utf8');
  return errorFileName;
};

const makeComments = (errorCodes) => {
  let codes = '';
  if (!lodash.isArray(errorCodes)) {
    return codes;
  }

  codes = '\n';
  let cursor = errorCodes.length - 1;
  let tpl = '  {name}: {comment}';
  lodash.map(errorCodes, (v, index) => {
    codes += tpl.replace(/{name}/g, v.name)
      .replace(/{comment}/g, `'${v.comment}'`)
      .replace(/"/g, '\'');
    if (cursor !== index) {
      codes += ',\n';
    }
  });

  return codes;
};
