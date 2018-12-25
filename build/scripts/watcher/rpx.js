/**
 * Auth: lijiang
 * Date: 2018/2/11
 * Description: rpx
 */
const watcher = require('chokidar');
const lodash = require('lodash');
const fs = require('fs');
const components = require('../../config/app/Components');
const utils = require('../utils/utils');

exports.watch = (config) => {
  let dir = `${config.PROJECT_PATH}/dist/`;
  watcher.watch(dir)
    .on('add', distFilesChange)
    .on('change', distFilesChange)
    // .on('link', distFilesChange)
    // .on('unlinkDir', distFilesChange)
    .on('addDir', distFilesChange);
};

function distFilesChange (path) {
  if (!lodash.isString(path)) {
    return;
  }
  let suffix = path.substring(path.lastIndexOf('.'), path.length);
  if (suffix === '.wxss') {
    changeRpx(path);
  }
  // if (suffix === '.js') {
  //   changeComponents(path);
  // }
  // if (suffix === '.json') {
  //   changeComponents(path);
  // }
}

function changeRpx (path) {
  let fileContent = fs.readFileSync(path, 'utf8');
  if (fileContent.indexOf(' rpx') < 0) {
    return;
  }
  replaceRpx(path, fileContent);
}

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

function changeComponents (path) {
  let fileContent = fs.readFileSync(path, 'utf8');
  if (fileContent.indexOf(`{{Components}}`) < 0) {
    return;
  }

  let c = JSON.stringify(components);
  let newFile = fileContent.replace(/'{{Components}}'/g, c).replace(/"{{Components}}"/g, c);
  fs.writeFileSync(path, newFile, 'utf8');

  let fileName = path.substring(path.lastIndexOf('/') + 1, path.length);
  utils.print(`compile components file: ${fileName}`);
}
