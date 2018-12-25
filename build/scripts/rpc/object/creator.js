/**
 * Auth: lijiang
 * Date: 2018/5/19
 * Description: creator
 */
const path = require('path');
const spawn = require('child_process');
const fs = require('fs');
const yamlParser = require('js-yaml');
const lodash = require('lodash');
const utils = require('../../utils/utils');

const PROJECT_PATH = path.resolve();
const SAVE_PATH = PROJECT_PATH + '/src/store/model/objects';
const OBJ_TEMPLATE_PATH = `${PROJECT_PATH}/build/scripts/rpc/object/template`;

class creator {
  constructor (gitPath, gitName, ignoreList = []) {
    this.gitPath = gitPath;
    this.gitName = gitName;
    this.ignoreList = ignoreList;
    this.gitProjPath = `${PROJECT_PATH}/${gitName}`;
    this.tplPath = `${this.gitProjPath}/CodeTemplates/Rpc/Objects`;
  }

  create () {
    this.ObjectList = [];
    this.__indexTimer = null;
    doCreate.call(this);
  }
}

function isIgnore (fileName) {
  let ignore = false;
  this.ignoreList.every((v, k) => {
    ignore = v === fileName;
    return !ignore;
  });
  return ignore;
}

function doCreate () {
  if (!fs.existsSync(this.gitProjPath)) {
    clone.call(this)
  } else {
    pull.call(this);
  }
}

function clone () {
  let cmd = `cd ${PROJECT_PATH} && git clone ${this.gitPath}`;
  spawn.exec(cmd, () => {
    generateObjects.call(this);
  });
}

function pull () {
  let cmd = `cd ${this.gitProjPath} && git pull origin master`;
  spawn.exec(cmd, () => {
    generateObjects.call(this);
  });
}

function generateObjects () {
  let me = this;
  fs.readdir(this.tplPath, (err, files) => {
    if (err) {
      console.assert(false, `read  objects error, ${err}`);
      return;
    }
    files.forEach((filename) => {
      let newPath = path.join(this.tplPath, filename);
      fs.stat(newPath, (err, stats) => {
        if (err) {
          console.assert(false, `compile object error, file is ${filename}, ${err}`);
          return;
        }
        if (stats.isFile()) {
          createObject.call(me, filename)
        }
      });
    });
  });
}

function makeParamComments (yaml) {
  let tpl = `  /**
   * 属性列表
   * @returns {
   *  {
{COMMENTS}
   *  }
   * }
   */`;

  let comment = `   *    {key}: '{comment}'`;

  let params = yaml.parameters;
  let comments = '';
  let count = params.length - 1;
  lodash.map(params, (v, k) => {
    comments += comment.replace(/{key}/g, v.name).replace(/{comment}/g, v.comment);
    if (k !== count) {
      comments += `,\n`;
    }
  });

  return tpl.replace(/{COMMENTS}/g, comments);
}

function createObject (file) {
  if (isIgnore.call(this, file.split('.')[0])) {
    return;
  }
  let absolutePath = `${this.tplPath}/${file}`;
  let content = fs.readFileSync(absolutePath, 'utf8');
  let yaml = yamlParser.safeLoad(content);

  let template = `${OBJ_TEMPLATE_PATH}/object`;
  let tplContent = fs.readFileSync(template, 'utf8');

  let data = makeObjectData.call(this, yaml);
  let objMap = makeObjectMap.call(this, yaml);
  let simpleName = file.replace('.yaml', '');

  let importTitle = makeImport.call(this, yaml);
  let parentCls = getParentClass.call(this, yaml);

  let paramsComments = makeParamComments.call(this, yaml);

  tplContent = tplContent.replace(/{VERSION}/g, yaml.version)
    .replace(/{DATA}/g, data)
    .replace(/{PARAM_COMMENTS}/g, paramsComments)
    .replace(/{ObjectName}/g, simpleName)
    .replace(/{IMPORT}/g, importTitle)
    .replace(/{PARENT}/g, parentCls)
    .replace(/{OBJECT_MAP}/g, objMap);

  let saveFile = `${SAVE_PATH}/${simpleName}.js`;
  fs.writeFileSync(saveFile, tplContent, 'utf8');

  utils.print(`create object file ${simpleName}.js`, 'magenta');

  this.ObjectList.push(simpleName);

  makeIndexFile.call(this);
}

function makeIndexFile () {
  if (this.__indexTimer) {
    clearTimeout(this.__indexTimer);
  }

  this.__indexTimer = setTimeout(() => {
    let imports = '';
    let exports = '';

    let count = this.ObjectList.length - 1;
    lodash.map(this.ObjectList, (v, k) => {
      imports += `import {${v}} from './${v}';\n`;
      exports += `  ${v}`;
      if (k !== count) {
        exports += ',\n';
      }
    });

    let template = `${OBJ_TEMPLATE_PATH}/index`;
    let tplContent = fs.readFileSync(template, 'utf8');

    tplContent = tplContent.replace(/{IMPORT}/g, imports).replace(/{LIST}/g, exports);

    let name = this.gitName.replace(new RegExp('-', 'g'), '');
    let saveFile = `${SAVE_PATH}/${name}.js`;
    fs.writeFileSync(saveFile, tplContent, 'utf8');

    utils.print(`${this.gitName} 创建model对象 ${this.ObjectList.length} 个, 忽略 ${this.ignoreList.length} 个`, 'blue');
  }, 500);
}

function makeObjectData (yaml) {
  let params = yaml.parameters;
  let data = '';
  let count = params.length - 1;
  lodash.map(params, (v, k) => {
    data += `      ${v.name}: null`;
    if (k !== count) {
      data += `,\n`;
    }
  });

  return data;
}

function makeObjectMap (yaml) {
  let map = {};
  let params = yaml.parameters;
  lodash.map(params, (v, k) => {
    let type = v.type;
    let name = v.name;
    let repeated = v.repeated || false;
    let require = v.require;
    if (type.indexOf('obj.') >= 0) {
      let p = {
        model: type.replace('obj.', '')
      };
      if (require) {
        p['require'] = true;
      }
      map[name] = p;
      if (repeated) {
        map[name]['repeated'] = true;
      }
    }
  });
  if (lodash.keys(map).length === 0) {
    return '';
  }

  let tpl = null;
  if (yaml.extends) {
    tpl = '\n\n  propertyTypeMap () {\n' +
      '    let superMap = super.propertyTypeMap();\n' +
      '    let map = {MAP};\n' +
      '    this.__lodash.map(superMap, (v, k) => {\n' +
      '      map[k] = v;\n' +
      '    });\n' +
      '    return map;\n' +
      '  }';

  } else {
    tpl = '\n\n  propertyTypeMap () {\n' +
      '    return {MAP};\n' +
      '  }';
  }
  return tpl.replace('{MAP}', JSON.stringify(map));
}

function getParentClass (yaml) {
  return yaml.extends || 'TableModelBase';
}

function makeImport (yaml) {
  if (yaml.extends) {
    return `import {${yaml.extends}} from './${yaml.extends}'`;
  } else {
    return `import {TableModelBase} from '../TableModelBase';`;
  }
}

exports.creator = creator;
