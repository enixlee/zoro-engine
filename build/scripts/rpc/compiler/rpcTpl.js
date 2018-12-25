/**
 * Auth: lijiang
 * Date: 2018/3/14
 * Description: rpc
 */
const path = require('path');
const fs = require('fs');
const lodash = require('lodash');

const projectPath = path.resolve();
const FILE_SAVE_PATH = `${projectPath}/src/api/rpc/`;

exports.compile = (fileName, savePath, yaml) => {
  if (!lodash.isObject(yaml.options)) {
    return null;
  }

  if (parseInt(yaml.options.openApi) !== 1) {
    return null;
  }
  let apiName = `${fileName}`;

  let template = fs.readFileSync(projectPath + '/build/scripts/rpc/template/RpcTemplate', 'utf8');
  template = template.replace(/{NAME}/g, apiName);
  template = template.replace(/{routeUrl}/g, yaml.routeUrl);
  let method = yaml.method === 'get' ? 'GET' : 'POST';
  template = template.replace(/{method}/g, method);
  let auth = needToken(yaml.parameters);
  template = template.replace(/{auth}/g, auth ? 'true' : 'false');
  template = template.replace(/{parameters}/g, makeParameters(yaml.parameters || []));
  template = template.replace(/{errorCode}/g, makeErrorCodes(yaml.errorCodes || []));
  template = template.replace(/{scope}/g, getScope(yaml.routeUrl));
  template = template.replace(/{routeName}/g, getScope(yaml.description));
  fs.writeFileSync(FILE_SAVE_PATH + apiName + '.js', template, 'utf8');

  return apiName;
};

const getScope = (routeUrl) => {
  return routeUrl.replace('/service_manage_', '').replace(/\//g, '.');
};

const needToken = (params) => {
  let needAuth = false;
  if (!lodash.isArray(params)) {
    return needAuth;
  }

  params.every((v, k) => {
    needAuth = v.name === 'userToken' && v.require;
    return !needAuth;
  });
  return needAuth;
};

const makeParameters = (params) => {
  let map = '';
  if (params.length > 0) {
    if (!(params.length === 1 && params[0].name === 'userToken')) {
      map += '\n';
      let count = params.length;
      for (let i = 0; i < count; i++) {
        let p = params[i];
        if (p.name === 'userToken') {
          continue;
        }
        map += makeParam(p);
        if (i < count - 1) {
          map += ',\n';
        }
      }
    }
  }
  return map;
};

const PARAM_TPL = `    {key}: {\n{content}    }`;

const makeParam = (p) => {
  let tpl = PARAM_TPL.replace(/{key}/g, p.name);
  let contentTpl = '      {key}: {value}';
  let content = '';
  if (lodash.isBoolean(p.require)) {
    content += `${contentTpl.replace('{key}', 'require').replace('{value}', p.require ? 'true' : 'false')}`;
  }

  if (!lodash.isUndefined(p.default)) {
    let value = (lodash.isBoolean(p.default) || lodash.isString(p.default)) ? `'${p.default}'` : p.default;
    let c = `${contentTpl.replace('{key}', 'default').replace('{value}', value)}`;
    if (content !== '') {
      content += ',\n';
    }
    content += `${c}`;
  }

  if (lodash.isNumber(p.min)) {
    let c = `${contentTpl.replace('{key}', 'min').replace('{value}', p.min)}`;
    if (content !== '') {
      content += ',\n';
    }
    content += `${c}`;
  }

  if (lodash.isNumber(p.max)) {
    let c = `${contentTpl.replace('{key}', 'max').replace('{value}', p.max)}`;
    if (content !== '') {
      content += ',\n';
    }
    content += `${c}`;
  }

  let typeCheck = makeTypeCheck(p);
  if (typeCheck.length > 0) {
    if (content !== '') {
      content += ',\n';
    }
    content += `${contentTpl.replace('{key}', 'typeCheck').replace('{value}', typeCheck)}\n`;
  }

  return tpl.replace('{content}', content);
};

const makeErrorCodes = (errorCodes) => {
  let map = '';
  if (errorCodes.length > 0) {
    map += '\n';
    let tpl = `    {key}: '{comment}'`;
    let count = errorCodes.length;
    for (let i = 0; i < count; i++) {
      let code = errorCodes[i];
      map += `${tpl.replace(/{key}/g, code.name).replace(/{comment}/g, code.comment)}`;
      if (i < count - 1) {
        map += ',\n';
      }
    }
    map = `,\n  errorCodes: {${map}\n  }`;
  }
  return map;
};

const makeTypeCheck = (p) => {
  let typeCheck = makeTypeCheckByType(p);
  return `(engine, v) => { ${typeCheck}; }`;
};

const makeTypeCheckByType = (param) => {
  let tpl = '';
  if (lodash.isArray(param.choice)) {
    if (param.type === 'json') {
      tpl = typeCheckJsonArrayChoice(param);
    } else {
      tpl = typeCheckChoice(param);
    }
  } else {
    switch (param.type) {
      case 'int':
      case 'float':
      case 'money':
      case 'money_cent':
      case 'moneyCent':
        tpl = typeCheckNumber(param);
        break;
      case 'bigint':
        tpl = typeCheckBigint(param);
        break;
      case 'datetime':
        tpl = typeCheckDateTime(param);
        break;
      case 'json':
        tpl = typeCheckJson(param);
        break;
      case 'cellphone':
        tpl = typeCheckCellphone(param);
        break;
      case 'md5':
        tpl = typeCheckMD5(param);
        break;
      case 'md5_16':
        tpl = typeCheckMD516(param);
        break;
      case 'id_card':
        tpl = typeCheckIDNo(param);
        break;
      case 'gender':
        tpl = typeCheckGender(param);
        break;
      case 'status':
        tpl = typeCheckStatus(param);
        break;
      case 'ratio':
        tpl = typeCheckRatio(param);
        break;
      case 'sortByAuctionStatus':
        tpl = typeCheckSortByAuctionStatus(param);
        break;
      case 'auctionDeliveryStatus':
        tpl = typeCheckAuctionDeliveryStatus(param);
        break;
      case 'number_verify_code':
      case 'email':
      case 'string':
      case 'stringNumber':
      case 'memberId':
      default:
        tpl = typeCheckString(param);
        break;
    }
  }
  return tpl;
};

/**
 * 整型
 * @param param
 * @returns {string}
 */
const typeCheckNumber = (param) => {
  let min = param.min || null;
  let max = param.max || null;
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `engine.$typeCheck.typeCheckNumber(v, ${min}, ${max}, ${nullEnable})`;
};

/**
 * 字符串
 * @param param
 * @returns {string}
 */
const typeCheckString = (param) => {
  let min = param.min || null;
  let max = param.max || null;
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;

  return `engine.$typeCheck.typeCheckString(v, ${min}, ${max}, ${nullEnable})`;
};

/**
 * bigint
 * @param param
 * @returns {string}
 */
const typeCheckBigint = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;

  return `engine.$typeCheck.typeCheckBigint(v, ${nullEnable})`;
};

/**
 * 日期
 * @param param
 * @returns {string}
 */
const typeCheckDateTime = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `engine.$typeCheck.typeCheckDateString(v, ${nullEnable})`;
};

/**
 * json
 * @param param
 * @returns {string}
 */
const typeCheckJson = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `engine.$typeCheck.typeCheckJsonString(v, ${nullEnable})`;
};

/**
 * 手机号
 * @param param
 * @returns {string}
 */
const typeCheckCellphone = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `engine.$typeCheck.typeCheckCellphone(v, ${nullEnable})`;
};

/**
 * md5
 * @param param
 * @returns {string}
 */
const typeCheckMD5 = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `engine.$typeCheck.typeCheckMd5(v, ${nullEnable})`;
};

/**
 * md5_16
 * @param param
 * @returns {string}
 */
const typeCheckMD516 = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `engine.$typeCheck.typeCheckMd5OfLength16(v, ${nullEnable})`;
};

/**
 * 身份证
 * @param param
 * @returns {string}
 */
const typeCheckIDNo = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `engine.$typeCheck.typeCheckIdNo(v, ${nullEnable})`;
};

/**
 * 性别
 * @param param
 * @returns {string}
 */
const typeCheckGender = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `engine.$typeCheck.typeCheckChoice(v, [0, 1, 2], ${nullEnable})`;
};

/**
 * 状态
 * @param param
 * @returns {string}
 */
const typeCheckStatus = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `engine.$typeCheck.typeCheckStatus(v, ${nullEnable})`;
};

/**
 * 万分比
 * @param param
 * @returns {string}
 */
const typeCheckRatio = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `engine.$typeCheck.typeCheckRatio(v, ${nullEnable})`;
};

/**
 * 选择
 * @param param
 * @returns {string}
 */
const typeCheckChoice = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  let choice = JSON.stringify(param.choice);
  return `engine.$typeCheck.typeCheckChoice(v, ${choice}, ${nullEnable})`;
};

/**
 * json array
 * @param param
 * @returns {string}
 */
const typeCheckJsonArrayChoice = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  let choice = JSON.stringify(param.choice);
  return `engine.$typeCheck.typeCheckJsonArrayChoice(v, ${choice}, ${nullEnable})`;
};

/**
 * sortby
 * @param param
 * @returns {string}
 */
const typeCheckSortByAuctionStatus = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  let choice = JSON.stringify([0, 1, 2, 3]);
  return `engine.$typeCheck.typeCheckChoice(v, ${choice}, ${nullEnable})`;
};

/**
 * 订单状态
 * @param param
 * @returns {string}
 */
const typeCheckAuctionDeliveryStatus = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  let choice = JSON.stringify([0, 1, 2, 10, 11, 20, 21, 30, 31, 40, 50, 60, 70, 71, 72, 80, 81, 100, 101]);
  return `engine.$typeCheck.typeCheckJsonArrayChoice(v, ${choice}, ${nullEnable})`;
};
