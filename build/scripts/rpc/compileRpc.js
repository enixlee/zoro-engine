/**
 * Auth: lijiang
 * Date: 2018/3/14
 * Description: compileRpc
 */
const spawn = require('child_process');
const fs = require('fs');
const lodash = require('lodash');
const yamlParser = require('js-yaml');
const compilerApi = require('./compiler/rpc');
const errorCompiler = require('./compiler/error');
const path = require('path');
const utils = require('../utils/utils');

class RpcCompiler {
  constructor (projectPath, rpcConfig, templateConfig) {
    this.__projectPath = projectPath;
    this.__rpcConfig = rpcConfig;
    this.__templateConfig = templateConfig;

    this.__codeTemplatePath = `${this.__projectPath}/${this.__templateConfig.CODE_TEMPLATE_NAME}`;

    this.__rpcSavePath = this.__projectPath + this.__rpcConfig.RPC_API_PATH + '/' + this.__formatGitProjectName() + '/';
    this.__errorSavePath = this.__projectPath + this.__rpcConfig.RPC_API_ERROR_CODE_PATH + '/' + this.__formatGitProjectName() + '/';
    this.__rpcList = templateConfig.RPC_LIST;
    this.__subjectFilePath = this.__projectPath + this.__rpcConfig.RPC_SUBJECT_PATH;

    this.__rpcIndexTimer = null;
    this.__errorIndexTimer = null;
  }

  __formatGitProjectName () {
    return lodash.camelCase(this.__templateConfig.CODE_TEMPLATE_NAME);
  }

  compile () {
    this.__apiFiles = [];
    this.__errorFiles = [];
    this.__subjects = [];

    this.pullCodeTemplate();
  }

  pullCodeTemplate () {
    if (!fs.existsSync(this.__codeTemplatePath)) {
      this.cloneCodeTemplateProject(this.composerUpdate);
    } else {
      this.pullCodeTemplateProject(this.clearDir);
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
      this.clearDir();
    });
  }

  /**
   * 导出rpc模板
   */
  generateRpc () {
    if (!fs.existsSync(this.__rpcSavePath)) {
      fs.mkdirSync(this.__rpcSavePath);
    }
    if (!fs.existsSync(this.__errorSavePath)) {
      fs.mkdirSync(this.__errorSavePath);
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

    let subjectName = lodash.isObject(find) ? find.RENAME: fileName;
    let rpcFileName = this.getRpcFileName(find);

    let content = fs.readFileSync(filePath, 'utf8');
    let yaml = yamlParser.safeLoad(content);

    // 生成rpc模板
    let file = compilerApi.compile(rpcFileName, this.__rpcSavePath, yaml);
    if (file !== null) {
      // 生成error模板
      let error = errorCompiler.compile(rpcFileName, this.__errorSavePath, this.__rpcConfig.RPC_API_ERROR_CODE_PATH, yaml);

      this.__apiFiles.push(file);
      // 生成index，每生成一个文件，就生成一次
      this.makeApiIndexFile();

      // 生成subject
      this.__subjects.push([subjectName, yaml.description, rpcFileName]);
      this.makeSubjectFile();

      if (error) {
        this.__errorFiles.push(error);
        this.makeErrorIndexFile();
      }

      utils.print(`export rpc file ${file}`);
    }
  }

  getRpcFileName (configPath) {
    let originName = lodash.isObject(configPath) ? configPath.NAME : configPath;
    let fileNamePrefixList = originName.split('/');
    let fileNamePrefix = '';
    lodash.map(fileNamePrefixList, (v) => {
      fileNamePrefix += v;
    });
    return `${this.__templateConfig.RPC_FILE_PREFIX}${fileNamePrefix}`;
  }

  subjectsTemplate (subject, comment, rpcFileName) {
    return `/**
 * ${comment}
 * @type {string}
 */
export const ${subject} = 'Rpc${rpcFileName}';\r\n`;
  }

  /**
   * 主题
   */
  makeSubjectFile () {
    let subjects = '';
    let content = fs.readFileSync(this.__subjectFilePath, 'utf8');
    lodash.map(this.__subjects, (v, k) => {
      let fileName = v[0];
      let comment = v[1];
      let subject = '';
      let words = lodash.words(fileName);
      let lastIndex = words.length - 1;
      words.forEach((v, k) => {
        subject += lodash.upperCase(v);
        if (k !== lastIndex) {
          subject += '_';
        }
      });

      let exportSubject = this.subjectsTemplate(subject, comment, v[2]);
      if (content.indexOf(exportSubject) < 0) {
        subjects += exportSubject;
      }
    });

    fs.appendFileSync(this.__subjectFilePath, subjects, 'utf8');
  }

  /**
   * 生成索引文件
   */
  makeApiIndexFile () {
    if (this.__rpcIndexTimer) {
      clearTimeout(this.__rpcIndexTimer);
    }

    this.__rpcIndexTimer = setTimeout(() => {

      let fileName = this.__formatGitProjectName() + '.js';
      let filePath = this.__rpcSavePath + fileName;
      let importTpl = `import {file} from './file';\n`;
      let rpcMapTpl = '{import}\nexport default {\n{map}};\n';

      let map = '';
      let imports = '';
      let cursor = this.__apiFiles.length - 1;
      lodash.map(this.__apiFiles, (v, k) => {
        map += `  ${v}`;
        imports += importTpl.replace(/file/g, v);
        if (k !== cursor) {
          map += ',\n';
        } else {
          map += '\n';
        }
      });

      let file = rpcMapTpl.replace(/{import}/g, imports).replace(/{map}/g, map);

      fs.writeFileSync(filePath, file, 'utf8');

    }, 500);
  }

  makeErrorIndexFile () {
    if (this.__errorIndexTimer) {
      clearTimeout(this.__errorIndexTimer);
    }

    this.__errorIndexTimer = setTimeout(() => {
      let fileName = this.__formatGitProjectName() + '.js';
      let filePath = this.__errorSavePath + fileName;
      let importTpl = `import file from './file';\n`;
      let errorMapTpl = '{import}\nexport default {\n{map}};\n';

      let map = '';
      let imports = '';
      let cursor = this.__errorFiles.length - 1;
      lodash.map(this.__errorFiles, (v, k) => {
        map += `  ${v}`;
        imports += importTpl.replace(/file/g, v);
        if (k !== cursor) {
          map += ',\n';
        } else {
          map += '\n';
        }
      });

      let file = errorMapTpl.replace(/{import}/g, imports).replace(/{map}/g, map);

      fs.writeFileSync(filePath, file, 'utf8');
    }, 500);
  }

  clearDir () {
    let delCmd = `rm -rf ${this.__rpcSavePath} && rm -rf ${this.__errorSavePath}`;
    spawn.exec(delCmd, () => {
      this.generateRpc();
    });
  }
}

exports.RpcCompiler = RpcCompiler;
