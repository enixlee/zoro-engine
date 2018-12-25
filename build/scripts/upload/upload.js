/**
 * Auth: lijiang
 * Date: 2018/3/27
 * Description: upload
 */
const BASE_PATH = 'dist';
const path = require('path');
const fs = require('fs');
const ASSETS_FILE_PATH = path.resolve() + `/${BASE_PATH}/`;
const co = require('co');
const OSS = require('ali-oss');
const utils = require('../utils/utils');
const lodash = require('lodash');

let rootDir = '';

function upload () {
  let argv = process.argv;
  let isProduct = argv[2] === 'product';

  let env = utils.loadEnv(isProduct);

  this.__budget = env.BUDGET;
  this.__client = new OSS({
    region: env.REGION,
    accessKeyId: env.ACCESS_KEY_ID,
    accessKeySecret: env.ACCESS_KEY_SECRET,
    bucket: env.BUDGET
  });

  rootDir = `${env.PROJECT_NAME}-${env.PLATFORM_ENV}/`;

  loadFiles(ASSETS_FILE_PATH);
}

upload();

/**
 * 读取文件
 * @param filePath
 */
function loadFiles (filePath) {
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
        if (stats.isFile()) {
          __uploadFiles(newPath, filename);
        } else if (stats.isDirectory()) {
          loadFiles(newPath);
        }
      });
    });
  });
}

function __getUploadPath (fileFullPath) {
  let paths = fileFullPath.split('/');
  let dir = '';
  let findRelativePath = false;
  let index = -1;
  lodash.map(paths, (v, k) => {
    if (findRelativePath && k > index && k <= paths.length - 2) {
      dir += `${v}/`;
    } else {
      if (v === BASE_PATH) {
        findRelativePath = true;
        index = k;
      }
    }
  });
  return dir;
}

/**
 * 上传文件
 * @param file
 * @param filename
 * @private
 */
function __uploadFiles (file, filename) {
  let client = this.__client;
  let budget = `${this.__budget}`;
  let dir = __getUploadPath(file);
  let relativePath = `/${rootDir}${BASE_PATH}/${dir}${filename}`;
  co(function* () {
    client.useBucket(budget);
    let result = yield client.put(relativePath, file);
    utils.print(`upload file: ${relativePath}, to budget: ${budget}, result is ${result}`);
  }).catch(function (err) {
    utils.print(`fail upload file: ${relativePath}, to budget: ${budget}, error is ${err}`, 'red');
    __uploadFiles(file, filename);
  });
}
