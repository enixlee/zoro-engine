/**
 * Auth: lijiang
 * Date: 2018/6/7
 * Description: index
 */
const path = require('path');
const spawn = require('child_process');
const fs = require('fs');
const objectCreator = require('./creator');

const PROJECT_PATH = path.resolve();
const SAVE_PATH = PROJECT_PATH + '/src/store/model/objects';
const OBJ_TEMPLATE_PATH = `${PROJECT_PATH}/build/scripts/rpc/object/template`;

const ObjectList = [
  {
    GIT_NAME: 'code-template-objects-rpc',
    GIT: 'git@gitlab.66plat.com:codeTemplate/code-template-objects-rpc.git',
    IGNORE: [
      'ActivityConditionFull',
      'AliOssClientConfig',
      'ApiInformation',
      'ApiParameterInformation',
      'AuctionEvaluationFull',
      'AuctionEvaluationMediaResourceFull',
      'HelloObject',
      'HelloObjectChild',
      'HelloObjectParent',
      'ObjectRPCCommandResult',
      'OssImageScanResult',
      'OssImageScanTypeResult',
      'OssTextScanResult',
      'OssTextScanTypeResult',
      'RPCQueryAuctionEvaluation',
      'ServerConfig'
    ]
  },
  {
    GIT_NAME: 'code-template-objects-manage',
    GIT: 'git@gitlab.66plat.com:codeTemplate/code-template-objects-manage.git',
    IGNORE: [
      'ManageServerConfig'
    ]
  }
];

exports.create = () => {
  if (!fs.existsSync(SAVE_PATH)) {
    fs.mkdirSync(SAVE_PATH);
  }

  clearFiles();
};

function clearFiles () {
  let delCmd = `cd ${SAVE_PATH} && rm -rf *.js`;
  spawn.exec(delCmd, () => {
    ObjectList.forEach((v, k) => {
      new objectCreator.creator(v.GIT, v.GIT_NAME, v.IGNORE).create();
    });

    // 创建索引文件
    let imports = '';
    let list = '';

    ObjectList.forEach((v, k) => {
      let name = v.GIT_NAME.replace(new RegExp('-', 'g'), '');
      imports += `import ${name} from './${name}.js';\n`;
      list += `  ...${name}`;
      if (k !== ObjectList.length - 1) {
        list += ',\n';
      }
    });

    let template = `${OBJ_TEMPLATE_PATH}/index`;
    let tplContent = fs.readFileSync(template, 'utf8');
    tplContent = tplContent.replace(/{IMPORT}/g, imports).replace(/{LIST}/g, list);

    let saveFile = `${SAVE_PATH}/index.js`;
    fs.writeFileSync(saveFile, tplContent, 'utf8');
  });
}
