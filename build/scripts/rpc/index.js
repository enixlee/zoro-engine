const rpcCompiler = require('./exportRpc');
const objectCreator = require('./object/index');
const spawn = require('child_process');
const path = require('path');
const lodash = require('lodash');
const fs = require('fs');

const BASE_PATH = path.resolve();
const RPC_PATH = `${BASE_PATH}/src/api/rpc/`;
let SUBJECT_PATH = null;

let timerRpcIndex = null;
let timerSubjects = null;

let apiList = [];
let subjects = [];

exports.compile = (config) => {
  let templateProjects = config.CUSTOM_CONFIGURE.RPC;
  let rpcConfig = config.BASE_CONFIGURE.RPC;
  SUBJECT_PATH = BASE_PATH + rpcConfig.RPC_SUBJECT_PATH;
  rpcConfig.RPC_TEMPLATE_PATH = RPC_PATH;

  let delCmd = `rm -rf ${RPC_PATH}`;
  spawn.exec(delCmd, () => {
    templateProjects.map((v) => {
      (new rpcCompiler.RpcCompiler(BASE_PATH, rpcConfig, v, saveRpcIndex, makeSubjectFile, apiList, subjects)).compile();
    });

    objectCreator.create();
  });
};

const saveRpcIndex = (list) => {
  if (timerRpcIndex) {
    clearTimeout(timerRpcIndex);
  }

  timerRpcIndex = setTimeout(() => {
    let importTpl = `import file from './file';\n`;
    let rpcMapTpl = '{import}export default {\n{map}};\n';

    let map = '';
    let imports = '';
    let cursor = list.length - 1;
    lodash.map(list, (v, k) => {
      map += `  ${v}`;
      imports += importTpl.replace(/file/g, v);
      if (k !== cursor) {
        map += ',\n';
      } else {
        map += '\n';
      }
    });

    let file = rpcMapTpl.replace(/{import}/g, imports).replace(/{map}/g, map);

    fs.writeFileSync(RPC_PATH + 'index.js', file, 'utf8');

    console.info(`接口文件 ${list.length} 个`);
  }, 1000);
};

const makeSubjectFile = (list) => {
  if (timerSubjects) {
    clearTimeout(timerSubjects);
  }

  timerSubjects = setTimeout(() => {
    let subjects = '';

    lodash.map(list, (v, k) => {
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

      subjects += subjectsTemplate(subject, comment, v[2]);
    });

    fs.writeFileSync(SUBJECT_PATH, subjects, 'utf8');

    console.info(`主题 ${list.length} 个`);
  }, 1000);
};

const subjectsTemplate = (subject, comment, rpcFileName) => {
  return `/**
 * ${comment}
 * @type {string}
 */
export const ${subject} = '${rpcFileName}';\r\n`;
};
