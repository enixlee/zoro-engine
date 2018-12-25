/**
 * Created by WebStorm.
 * Author: enixlee
 * Date: 2017/3/2
 * Time: 下午3:25
 */
import {Base} from '../common/Base';

const __response = Symbol('response');

export class RpcCommandResult extends Base {
  constructor (httpResponse) {
    super();

    this.__assert.hasKey('data', httpResponse);

    this[__response] = httpResponse.data;
  }

  originName () {
    return 'engine.rpc.RpcCommandResult';
  }

  getCommand () {
    return this[__response]['command_name'];
  }

  getDescription () {
    return this[__response]['description'];
  }

  getCode () {
    return this[__response]['code'];
  }

  getData () {
    return this[__response]['data'];
  }

  isSucc () {
    return this[__response]['succ'];
  }

  setRequest (params) {
    this[__response]['requestParams'] = params;
    return this;
  }

  getRequest () {
    return this[__response]['requestParams'] || {};
  }

  resetRetData (data) {
    this[__response]['data'] = data;
  }

  setData (data) {
    this[__response]['data'] = data;
    return this;
  }

  getRpc () {
    return this.getEngine().$rpc.findRpcByRpcCmd(this.getCommand());
  }
}

/**
 * 生成response对象
 * @param cmd
 * @param succ
 * @param desc
 * @param data
 * @returns {{data: {command_name: *, description: *, succ: *, data: *}}}
 */
export const createResponse = (cmd, succ, desc, data) => {
  return {
    data: {
      command_name: cmd,
      description: desc,
      succ: succ,
      data: data
    }
  };
};
