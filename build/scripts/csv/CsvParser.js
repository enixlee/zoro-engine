/**
 * Auth: lijiang
 * Date: 2018/1/13
 * Description: ParseResource
 */
const lodash = require('lodash');
const spawn = require('child_process');
const chalk = require('chalk');
const rm = require('rimraf');
const csv = require('fast-csv');
const fs = require('fs');

let projectPath = null;
let baseCsvConfig = null;
let customCsvConfig = null;

let csvGitLocalPath = null;
let csvResourcePath = null;

/**
 * 解析配置文件
 * @param config
 */
exports.parse = (config) => {
  // 加载配置
  loadConfig(config);
  // 解析
  pullGitFiles();
};

/**
 * 加载配置
 * @param config
 */
function loadConfig (config) {
  let customConfig = config['CUSTOM_CONFIGURE'];
  let baseConfig = config['BASE_CONFIGURE'];

  projectPath = config.PROJECT_PATH;
  customCsvConfig = customConfig['RESOURCE_COMPILE']['CSV'];
  baseCsvConfig = baseConfig['RESOURCE_COMPILE']['CSV'];

  csvGitLocalPath = `${projectPath}/${customCsvConfig['CSV_PROJECT_NAME']}/`;
  csvResourcePath = `${projectPath}/${customCsvConfig['CSV_PROJECT_NAME']}/${customCsvConfig['CSV_TEMPLATE_PATH']}/`;
}

/**
 * 拉取配置文件
 */
function pullGitFiles () {
  if (!fs.existsSync(csvGitLocalPath)) {
    cloneCsvProject(parseCsvFile);
  } else {
    pullCsvProject(parseCsvFile);
  }
}

/**
 * clone工程
 */
function cloneCsvProject (callback) {
  let cmd = `git clone ${customCsvConfig['CSV_GIT']}`;
  console.log(chalk.yellow(`git clone: ${customCsvConfig['CSV_GIT']}`));
  spawn.exec(cmd, function () {
    if (lodash.isFunction(callback)) {
      callback();
    }
  });
}


/**
 * 拉取csv工程
 * @param callback
 */
function pullCsvProject (callback) {
  let cmdPull = `git pull origin master`;
  let cmd = `cd ${csvGitLocalPath} && ${cmdPull}`;
  console.log(chalk.yellow(`git pull: ${customCsvConfig['CSV_GIT']}`));
  spawn.exec(cmd, function () {
    if (lodash.isFunction(callback)) {
      callback();
    }
  });
}

// ---------- 解析配置文件 ------------
function parseCsvFile () {
  console.log(chalk.cyan(`begin parse csv config files:`));

  spawn.exec(`cd ${csvGitLocalPath} && rm -rf *.csv`, () => {
    transXls();
  });
}

let totalCount = 0;

function transXls () {
  fs.readdir(csvResourcePath, function (err, files) {
    if (err) {
      return;
    }
    let xlsxFiles = [];
    files.forEach((v, k) => {
      v.indexOf('.xlsx') > 0 ? xlsxFiles.push(v) && totalCount++ : null;
    });

    xlsxFiles.map((v, k) => {
      let csvName = v.split('.xlsx')[0] + '.csv';
      spawn.exec(`cd ${csvGitLocalPath} && ssconvert ${v} ${csvName}`);
    });

    deleteDir(readDir)
  });
}

function deleteDir (fn) {
  let path = `${projectPath}${baseCsvConfig['PROJECT_SAVE_PATH']}`;
  rm(path, function (err) {
    if (err) {
      console.log(chalk.red(`fail transform: ${err}`));
    } else {
      if (!fs.existsSync(path)) {
        try {
          fs.mkdirSync(path);
        } catch (mkdirErr) {
          console.log(chalk.red(`fail make dir: ${err}`));
        }
      }

      if (lodash.isFunction(fn)) {
        fn();
      }
    }
  });
}

let fileCount = 0;

function readDir () {
  fs.readdir(csvResourcePath, function (err, files) {
    if (err) {
      return;
    }

    fileCount = 0;
    files.forEach((v, k) => {
      v.indexOf('.csv') > 0 ? fileCount++ : null;
    });

    if (totalCount === fileCount) {
      files.forEach(function (filename) {
        transfer(filename);
      });
    } else {
      setTimeout(readDir, 1000);
    }
  });
}

function transfer (name) {
  let path = `${csvResourcePath}${name}`;
  fs.stat(path, function (err, stat) {
    let ext = getFileExt(name);
    if (stat.isFile() && ext === 'csv') {
      parseBegin(name);
    } else {
      parseComplete();
    }
  });
}

function getFileExt (url) {
  let arr = url.split('.');
  let len = arr.length;
  return arr[len - 1];
}

function parseBegin (fileName) {
  let path = `${csvResourcePath}${fileName}`;
  let stream = fs.createReadStream(path);
  let fileContents = [];

  let csvStream = csv
    .parse()
    .on("data", function (data) {
      fileContents.push(data);
    })
    .on("end", function () {
      parseCsv(generateJsFileName(fileName), fileContents);
      console.log(chalk.yellow(`compile file: ${fileName} complete!`));
      parseComplete();
    });
  stream.pipe(csvStream);
}

function generateJsFileName (name) {
  let arr = name.split('.');
  let prefix = arr[0];
  let start = prefix.lastIndexOf('-') + 1;
  return prefix.substring(start, prefix.length) + '.js';
}

/**
 * 完成
 * @returns {boolean}
 */
function parseComplete () {
  fileCount--;
  if (fileCount === 0) {
    console.log(chalk.cyan(`parse csv files complete!`));
  }

  return fileCount === 0;
}

// ------------- 解析模板 --------------
function parseCsv (jsFile, csvContent) {
  let header = csvContent[0];
  let headerTypes = csvContent[2];
  let information = lodash.takeRight(csvContent, csvContent.length - 5);

  let js = '';
  let infoLength = information.length;
  for (let i = 0; i < infoLength; i++) {
    let row = makeRow(header, information[i], headerTypes);
    js += i < infoLength - 1 ? `${row},\n` : `${row}\n`;
  }

  let arrayName = jsFile.split('.')[0];
  let exportName = makeExportName(arrayName);
  let fileInfo = `export const ${exportName} = [\n` + js + `];\n`;
  let path = `${projectPath}${baseCsvConfig['PROJECT_SAVE_PATH']}`;
  fs.writeFileSync(path + jsFile, fileInfo);
}

/**
 * 行
 * @param header
 * @param rowData
 * @param headerType
 * @returns {string}
 */
function makeRow (header, rowData, headerType) {
  let content = '';
  let length = header.length;
  for (let i = 0; i < length; i++) {
    if (headerType[i] === '') {
      continue;
    }
    let type = headerType[i];
    let value = rowData[i];
    let valid = checkColumnDataValid(type, value);
    if (valid) {
      let data = makeDataByType(type, value);
      content += `${header[i]}: ${data}`;
      content += i < length - 1 ? ', ' : '';
    }
  }
  if (content.lastIndexOf(',') === content.length - 2) {
    content = content.substring(0, content.length - 2);
  }

  return `  {${content}}`;
}

function checkColumnDataValid (type, data) {
  let valid = false;
  switch (type) {
    case 'int':
      valid = !lodash.isNaN(parseInt(data));
      break;
    case 'string':
      valid = lodash.isString(data) && data.length > 0;
      break;
    case 'array':
      valid = lodash.isString(data) && data.length > 0;
      break;
    default:
      break;
  }
  return valid;
}

/**
 * 解析数据格式
 * @param type
 * @param data
 * @returns {*}
 */
function makeDataByType (type, data) {
  let ret = data;
  switch (type) {
    case 'int':
      ret = parseInt(data);
      break;
    case 'string':
      data = lodash.trim(data).replace(/\s+/g, '');
      ret = `'${data}'`;
      break;
    case 'array':
      ret = makeArray(data);
      break;
  }

  return ret;
}

/**
 * 数组格式
 * @param arrayData
 * @returns {Array}
 */
function makeArray (arrayData) {
  if (!lodash.isString(arrayData) || arrayData.length === 0) {
    return null;
  }
  return arrayData.split(',');
}

/**
 * 参数名称
 * @param name
 */
function makeExportName (name) {
  return lodash.camelCase(name);
}

