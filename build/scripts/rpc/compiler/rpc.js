/**
 * Auth: lijiang
 * Date: 2018/3/14
 * Description: rpc
 */
const path = require('path');
const fs = require('fs');
const lodash = require('lodash');

const projectPath = path.resolve();

exports.compile = (fileName, savePath, yaml, simpleName) => {
  if (!lodash.isObject(yaml.options)) {
    return null;
  }

  if (parseInt(yaml.options.openApi) !== 1) {
    return null;
  }

  let apiName = `Rpc${fileName}`;

  let template = fs.readFileSync(projectPath + '/build/scripts/rpc/template/Rpc', 'utf8');
  let date = (new Date()).toLocaleString();
  let api = template.replace(/{{Date}}/g, date);
  api = api.replace(/{{rpcDesc}}/g, yaml.description || apiName);
  api = api.replace(/{{rpcName}}/g, apiName);
  api = api.replace(/{{rpcMethod}}/g, yaml.routeUrl);
  api = api.replace(/{{rpcType}}/g, yaml.method);
  api = api.replace(/{{simpleName}}/g, simpleName);
  api = api.replace(/{{rpcScope}}/g, getScope(yaml.routeUrl));

  let yamlParams = yaml.parameters;

  let comments = makeComments(yamlParams);
  api = api.replace(/{{comments}}/g, comments);

  let params = makeParams(yamlParams);
  api = api.replace(/{{params}}/g, params);
  api = api.replace(/{{data}}/g, makeModelData(yamlParams));

  let auth = needToken(yamlParams);
  api = api.replace(/{{needAuth}}/g, auth ? 'true' : 'false');
  fs.writeFileSync(savePath + apiName + '.js', api, 'utf8');

  let requestTemplate = fs.readFileSync(projectPath + '/build/scripts/rpc/template/RpcRequest', 'utf8');
  let request = requestTemplate.replace(/{{rpcDesc}}/g, yaml.description || apiName);
  request = request.replace(/{{rpcName}}/g, apiName);
  request = request.replace(/{{dataInit}}/g, makeRequestData(yamlParams));
  let typeCheck = makeTypeCheck(yamlParams);
  request = request.replace(/{{typeCheck}}/g, typeCheck);
  let initParams = makeInitParams(yamlParams);
  request = request.replace(/{{initParams}}/g, initParams);
  fs.writeFileSync(`${savePath}${apiName}Request.js`, request, 'utf8');

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

/**
 * 数据模板
 * @param params
 * @returns {string}
 */
const makeRequestData = (params) => {
  if (!lodash.isArray(params)) {
    return '';
  }
  let cursor = params.length - 1;
  let paramsTemplate = '\n';
  lodash.map(params, (v, index) => {
    if (v.name !== 'userToken') {
      let D = 'null';
      if (lodash.isNumber(v.default) || lodash.isBoolean(v.default) || lodash.isString(v.default)) {
        if (lodash.isString(v.default)) {
          D = `'${v.default}'`;
        } else {
          D = `${v.default}`;
        }
      }
      paramsTemplate += `      ${v.name} : ${D}`;
      if (index !== cursor) {
        paramsTemplate += ',\n';
      }
    }
  });

  return paramsTemplate;
};

/**
 *
 * @param params
 * @returns {string}
 */
const makeComments = (params) => {
  if (!lodash.isArray(params)) {
    return '';
  }

  let paramsTemplate = '\n';
  let template = ' * @param {{param}} {{{type}}} {{comment}}';
  let cursor = params.length - 1;
  lodash.map(params, (v, index) => {
    if (v.name !== 'userToken') {
      paramsTemplate += template.replace(/{{param}}/g, v.name);
      if (v.type) {
        paramsTemplate = paramsTemplate.replace(/{{type}}/g, v.type);
      }
      if (v.comment) {
        paramsTemplate = paramsTemplate.replace(/{{comment}}/g, v.comment);
      }
      if (cursor !== index) {
        paramsTemplate += '\n';
      }
    }
  });
  paramsTemplate = paramsTemplate.replace(/"/g, '\'');

  return paramsTemplate;
};

/**
 * 生成参数
 * @param params
 * @returns {string}
 */
const makeParams = (params) => {
  if (!lodash.isArray(params)) {
    return '';
  }
  let cursor = params.length - 1;
  let paramsTemplate = '\n';
  let tpl = '    {{name}}';
  lodash.map(params, (v, index) => {
    if (v.name !== 'userToken') {
      paramsTemplate += tpl.replace(/{{name}}/g, v.name);
      if (lodash.isNumber(v.default) || lodash.isBoolean(v.default) || lodash.isString(v.default)) {
        if (lodash.isString(v.default)) {
          paramsTemplate += ` = '${v.default}'`;
        } else {
          paramsTemplate += ` = ${v.default}`;
        }
      } else {
        if (v.require) {
          // do nothing
        } else {
          paramsTemplate += ` = null`;
        }
      }

      if (index !== cursor) {
        paramsTemplate += ',\n';
      } else {
        paramsTemplate += '\n';
      }
    }
  });

  return paramsTemplate;
};

/**
 * 生成参数
 * @param params
 * @returns {string}
 */
const makeModelData = (params) => {
  if (!lodash.isArray(params)) {
    return '';
  }
  let cursor = params.length - 1;
  let paramsTemplate = '\n';
  let tpl = '      {{name}} : {{name}}';
  lodash.map(params, (v, index) => {
    if (v.name !== 'userToken') {
      paramsTemplate += tpl.replace(/{{name}}/g, v.name);
      if (index !== cursor) {
        paramsTemplate += ',\n';
      }
    }
  });

  return paramsTemplate;
};

/**
 * 初始化请求参数
 * @param params
 * @returns {string}
 */
const makeInitParams = (params) => {
  let tpl = '';
  if (!lodash.isArray(params)) {
    return tpl;
  }
  let paramsTpl =
    `    let {param} = this.get('{param}');\n` +
    '    if (!this.getEngine().$lodash.isNull({param}) && !this.getEngine().$lodash.isUndefined({param})) {\n' +
    `      params['{param}'] = {param};\n` +
    '    }\n';
  lodash.map(params, (v) => {
    if (v.name !== 'userToken') {
      tpl += paramsTpl.replace(/{param}/g, v.name);
    }
  });

  return tpl;
};

/**
 * 类型检测
 * @param params
 * @returns {string}
 */
const makeTypeCheck = (params) => {
  if (!lodash.isArray(params)) {
    return '';
  }

  let typeCheckTemplate = '';
  let tpl = '    {{typeCheck}};';
  let count = params.length - 1;
  lodash.map(params, (v, k) => {
    if (v.name !== 'userToken') {
      let tc = makeTypeCheckByType(v);
      typeCheckTemplate += tpl.replace(/{{typeCheck}}/g, tc);
      if (k < count) {
        typeCheckTemplate += '\n';
      }
    }
  });

  return typeCheckTemplate;
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
  return `this.getEngine().$typeCheck.typeCheckNumber(this.get('${param.name}'), ${min}, ${max}, ${nullEnable})`;
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

  return `this.getEngine().$typeCheck.typeCheckString(this.get('${param.name}'), ${min}, ${max}, ${nullEnable})`;
};

/**
 * bigint
 * @param param
 * @returns {string}
 */
const typeCheckBigint = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;

  return `this.getEngine().$typeCheck.typeCheckBigint(this.get('${param.name}'), ${nullEnable})`;
};

/**
 * 日期
 * @param param
 * @returns {string}
 */
const typeCheckDateTime = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `this.getEngine().$typeCheck.typeCheckDateString(this.get('${param.name}'), ${nullEnable})`;
};

/**
 * json
 * @param param
 * @returns {string}
 */
const typeCheckJson = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `this.getEngine().$typeCheck.typeCheckJsonString(this.get('${param.name}'), ${nullEnable})`;
};

/**
 * 手机号
 * @param param
 * @returns {string}
 */
const typeCheckCellphone = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `this.getEngine().$typeCheck.typeCheckCellphone(this.get('${param.name}'), ${nullEnable})`;
};

/**
 * md5
 * @param param
 * @returns {string}
 */
const typeCheckMD5 = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `this.getEngine().$typeCheck.typeCheckMd5(this.get('${param.name}'), ${nullEnable})`;
};

/**
 * md5_16
 * @param param
 * @returns {string}
 */
const typeCheckMD516 = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `this.getEngine().$typeCheck.typeCheckMd5OfLength16(this.get('${param.name}'), ${nullEnable})`;
};

/**
 * 身份证
 * @param param
 * @returns {string}
 */
const typeCheckIDNo = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `this.getEngine().$typeCheck.typeCheckIdNo(this.get('${param.name}'), ${nullEnable})`;
};

/**
 * 性别
 * @param param
 * @returns {string}
 */
const typeCheckGender = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `this.getEngine().$typeCheck.typeCheckChoice(this.get('${param.name}'), [0, 1, 2], ${nullEnable})`;
};

/**
 * 状态
 * @param param
 * @returns {string}
 */
const typeCheckStatus = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `this.getEngine().$typeCheck.typeCheckStatus(this.get('${param.name}'), ${nullEnable})`;
};

/**
 * 万分比
 * @param param
 * @returns {string}
 */
const typeCheckRatio = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  return `this.getEngine().$typeCheck.typeCheckRatio(this.get('${param.name}'), ${nullEnable})`;
};

/**
 * 选择
 * @param param
 * @returns {string}
 */
const typeCheckChoice = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  let choice = JSON.stringify(param.choice);
  return `this.getEngine().$typeCheck.typeCheckChoice(this.get('${param.name}'), ${choice}, ${nullEnable})`;
};

/**
 * json array
 * @param param
 * @returns {string}
 */
const typeCheckJsonArrayChoice = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  let choice = JSON.stringify(param.choice);
  return `this.getEngine().$typeCheck.typeCheckJsonArrayChoice(this.get('${param.name}'), ${choice}, ${nullEnable})`;
};

/**
 * sortby
 * @param param
 * @returns {string}
 */
const typeCheckSortByAuctionStatus = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  let choice = JSON.stringify([0, 1, 2, 3]);
  return `this.getEngine().$typeCheck.typeCheckChoice(this.get('${param.name}'), ${choice}, ${nullEnable})`;
};

/**
 * 订单状态
 * @param param
 * @returns {string}
 */
const typeCheckAuctionDeliveryStatus = (param) => {
  let nullEnable = param.hasOwnProperty('require') ? !param.require : true;
  let choice = JSON.stringify([0, 1, 2, 10, 11, 20, 21, 30, 31, 40, 50, 60, 70, 71, 72, 80, 81, 100, 101]);
  return `this.getEngine().$typeCheck.typeCheckJsonArrayChoice(this.get('${param.name}'), ${choice}, ${nullEnable})`;
};
