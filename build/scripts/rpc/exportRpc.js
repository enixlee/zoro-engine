/**
 * Auth: lijiang
 * Date: 2018/3/14
 * Description: compileRpc
 */
const spawn = require('child_process');
const fs = require('fs');
const lodash = require('lodash');
const yamlParser = require('js-yaml');
const compilerApi = require('./compiler/rpcTpl');
const path = require('path');
const utils = require('../utils/utils');

class RpcCompiler {
  constructor (projectPath, rpcConfig, templateConfig, saveRpcIndex, saveSubjectFile, apiList, subjects) {
    this.__projectPath = projectPath;
    this.__rpcConfig = rpcConfig;
    this.__templateConfig = templateConfig;

    this.__codeTemplatePath = `${this.__projectPath}/${this.__templateConfig.CODE_TEMPLATE_NAME}`;

    this.__rpcSavePath = this.__rpcConfig.RPC_TEMPLATE_PATH;
    this.__rpcList = templateConfig.RPC_LIST;

    this.__saveRpcIndex = saveRpcIndex;
    this.__saveSubjectFile = saveSubjectFile;

    this.__apiFiles = apiList;
    this.__subjects = subjects;
  }

  compile () {
    this.pullCodeTemplate();
  }

  pullCodeTemplate () {
    if (!fs.existsSync(this.__codeTemplatePath)) {
      this.cloneCodeTemplateProject(this.composerUpdate);
    } else {
      this.pullCodeTemplateProject(this.generateRpc);
    }
  }

  cloneCodeTemplateProject (callback) {
    let cmd = `git clone ${this.__templateConfig.CODE_TEMPLATE_GIT}`;
    spawn.exec(cmd, () => {
      if (lodash.isFunction(callback)) {
        callback.call(this);
      }
    });
  }

  pullCodeTemplateProject (callback) {
    let cmdPull = `git pull origin master`;
    let cmd = `cd ${this.__codeTemplatePath} && ${cmdPull}`;
    spawn.exec(cmd, () => {
      let needComposerUpdate = this.__templateConfig.COMPOSER_UPDATE_AFTER_PULL;
      if (needComposerUpdate) {
        this.composerUpdate();
      } else if (lodash.isFunction(callback)) {
        callback.call(this);
      }
    });
  }

  composerUpdate () {
    let cmd = `cd ${this.__codeTemplatePath} && composer update -vvv`;
    spawn.exec(cmd, () => {
      this.generateRpc();
    });
  }

  /**
   * 导出rpc模板
   */
  generateRpc () {
    if (!fs.existsSync(this.__rpcSavePath)) {
      fs.mkdirSync(this.__rpcSavePath);
    }

    // 读文件
    let templatePath = this.__codeTemplatePath + this.__templateConfig.CODE_TEMPLATE_PATH + '/';
    this.readFiles(templatePath);
  }

  readFiles (templatePath) {
    let me = this;
    fs.readdir(templatePath, (err, files) => {
      if (err) {
        console.assert(false, `read rpc tpl error, path is ${templatePath}, ${err}`);
        return;
      }
      files.forEach((filename) => {
        let newPath = path.join(templatePath, filename);
        fs.stat(newPath, (err, stats) => {
          if (err) {
            console.assert(false, `compile rpc error, file is ${filename}, ${err}`);
            return;
          }
          if (stats.isFile()) {
            let file = filename.replace('.yaml', '');
            me.makeFile(newPath, file);
          } else if (stats.isDirectory()) {
            me.readFiles(newPath);
          }
        });
      });
    });
  }

  /**
   * 生成模板
   * @param filePath
   * @param fileName
   */
  makeFile (filePath, fileName) {
    let find = this.__rpcList.find((v) => {
      let rpcName = lodash.isObject(v) ? v.NAME : v;
      return filePath.indexOf(rpcName + '.yaml') >= 0;
    });
    if (!(lodash.isString(find) && find.length > 0) && !lodash.isObject(find)) {
      return;
    }

    let isOBj = lodash.isObject(find);
    let originName = isOBj ? find.NAME : find;
    let subjectName = isOBj ? find.RENAME : fileName;
    let fileNamePrefixList = originName.split('/');
    let fileNamePrefix = '';

    lodash.map(fileNamePrefixList, (v) => {
      fileNamePrefix += v;
    });
    // let rpcFileName = `${this.__templateConfig.RPC_FILE_PREFIX}${fileNamePrefix}`;
    let rpcName = isOBj ? find.RENAME : fileNamePrefixList[fileNamePrefixList.length - 1];

    let content = fs.readFileSync(filePath, 'utf8');
    let yaml = yamlParser.safeLoad(content);

    // 生成rpc模板
    let file = compilerApi.compile(rpcName, this.__rpcSavePath, yaml);
    if (file !== null) {
      this.__apiFiles.push(file);
      // 生成index，每生成一个文件，就生成一次
      this.__saveRpcIndex(this.__apiFiles);

      // 生成subject
      this.__subjects.push([subjectName, yaml.description, rpcName]);
      this.__saveSubjectFile(this.__subjects);

      utils.print(`export rpc file ${file}`);
    }
  }
}

exports.RpcCompiler = RpcCompiler;
