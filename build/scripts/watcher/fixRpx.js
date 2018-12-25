/**
 * Auth: lijiang
 * Date: 2018/4/8
 * Description: fixRpx
 */
const path = require('path');
const fs = require('fs');
const utils = require('../utils/utils');
const spawn = require('child_process');

exports.fixRpx = (config) => {
  let dir = `${config.PROJECT_PATH}/dist/`;
  loadFiles(dir);

  // 拷贝minui
  copyMinUI();
};

/**
 * 读取文件
 * @param filePath
 */
const loadFiles = (filePath) => {
  fs.readdir(filePath, (err, files) => {
    if (err) {
      console.assert(false, `read files error, path is ${filePath}, ${err}`);
      return;
    }
    files.forEach((filename) => {
      let newPath = path.join(filePath, filename);
      fs.stat(newPath, (err, stats) => {
        if (err) {
          console.assert(false, `compile file error, file is ${filename}, ${err}`);
          return;
        }
        if (stats.isFile() && newPath.indexOf('.wxss') > 0) {
          // 修复
          fixRpxBugs(newPath);
        } else if (stats.isDirectory()) {
          loadFiles(newPath);
        }
      });
    });
  });
};

/**
 * 修复rpx异常
 * @param file
 */
const fixRpxBugs = (file) => {
  let fileContent = fs.readFileSync(file, 'utf8');
  if (fileContent.indexOf(' rpx') < 0) {
    return;
  }

  replaceRpx(file, fileContent);
};

const replaceRpx = (file, content) => {
  if (content.indexOf(' rpx') >= 0) {
    let newFile = content.replace(/\s+rpx/, 'rpx');
    replaceRpx(file, newFile);
  } else {
    fs.writeFileSync(file, content, 'utf8');
    let fileName = file.substring(file.lastIndexOf('/') + 1, file.length);
    utils.print(`fix rpc bugs of wxss file: ${fileName}`, 'red');
  }
};

// 修复minui bug
let RESOURCE_MIN_UI = path.resolve() + '/resource/ui/@minui/*';
let EXTERNAL_MIN_UI = path.resolve() + '/dist/external/ui/minui/';

let UI_PATH = [
  'external',
  'ui',
  'minui'
];

const copyMinUI = () => {
  if (!fs.existsSync(EXTERNAL_MIN_UI)) {
    fs.mkdirSync(EXTERNAL_MIN_UI);
  }

  let dir = path.resolve() + '/dist';
  UI_PATH.forEach((v) => {
    dir += `/${v}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });

  let cmd = `yes|cp -fr ${RESOURCE_MIN_UI} ${EXTERNAL_MIN_UI}`;
  spawn.exec(cmd, () => {
    utils.print('fix minui components', 'magenta');
  });
};
