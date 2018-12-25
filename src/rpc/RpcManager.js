/**
 * Auth: lijiang
 * Date: 2018/3/14
 * Description: RpcManager
 */
import {Base} from '../common/Base';
import {RpcCommandResult} from './RpcCommandResult';
import axios from 'axios';
import * as qs from 'qs';
import {RpcRequest} from './RpcRequest';

const __rpcObjects = Symbol('__rpcObjects');
const __rpcMap = Symbol('rpcMap');
const __resultAdapter = Symbol('__resultAdapter');
const __succDealer = Symbol('__succDealer');
const __rpcQueue = Symbol('__rpcQueue');

/**
 * 初始化
 * @private
 */
function __build () {
  this[__rpcObjects] = {};
  this[__rpcMap] = {};
  this[__succDealer] = null;
  this[__rpcQueue] = [];

  let self = this;
  this.__defineGetter__('callRpc', () => {
    return (subject) => {
      return self.getRpcRequest(subject);
    };
  });
}

/**
 * 填充request
 * @param request
 * @returns {*}
 * @private
 */
function __fillRequest (request) {
  return request;
}

function __showLoading () {
  // 500ms 后显示loading
  this.getEngine().$kv.setItem('HTTP_REQUEST_STATE', true);
  this.getEngine().$juggler.registerWorker('rpc-loading-timer', 500, this, () => {
    // this.getEngine().showLoading();
  }, true);
}

function __closeLoading () {
  this.getEngine().$kv.setItem('HTTP_REQUEST_STATE', false);
  this.getEngine().$juggler.unRegisterWorker('rpc-loading-timer');
  // this.getEngine().closeLoading();
}

export class RpcManager extends Base {
  originName () {
    return 'engine.RpcManager';
  }

  pluginInit () {
    __build.call(this);
  }

  install () {
    this.getEngine().registerPlugin('$axios', axios);
    this.getEngine().registerPlugin('$rpc', this);
  }

  getRpcRequest (subject) {
    let rpc = this[__rpcObjects][subject];
    if (!this.__lodash.isObject(rpc)) {
      rpc = new RpcRequest(this.getEngine()).initFromArray(this[__rpcMap][subject]);
      this[__rpcObjects][subject] = rpc;
    }
    return rpc;
  }

  mockEnable () {
    // todo 暂时不开放mock
    return false;
  }

  mock (rpcName) {
    // todo
    return {};
  }

  /**
   * 根据rpc命令查找rpc
   * @param rpcCmd
   * @private
   */
  findRpcByRpcCmd (rpcCmd) {
    let rpc = this.__lodash.pickBy(this[__rpcObjects], (v, k) => {
      return v.getMethod() === rpcCmd;
    });

    this.__assert.isNotNil(rpc, `rpc cmd invalid, got ${rpcCmd}`);

    return this.__lodash.values(rpc)[0];
  }

  /**
   * 装载接口，用时初始化
   * @param rpcMap
   */
  installRPCs (rpcMap) {
    this.__assert.isObject(rpcMap, `rpc map must be an object, got ${rpcMap}`);

    this[__rpcMap] = rpcMap;
  }

  /**
   * rpc配置
   * @returns {*}
   */
  getRpcMap () {
    return this.__lodash.cloneDeep(this[__rpcMap]);
  }

  /**
   * 注册rpcCommand处理器
   * @param succDealer
   */
  registerRpcCommandDealer (succDealer) {
    this[__succDealer] = succDealer;
  }

  /**
   * 注册结果适配器
   * @param adapter
   */
  registerRpcResultAdapter (adapter) {
    this[__resultAdapter] = adapter;
  }

  getRpcResultAdapter () {
    return this[__resultAdapter];
  }

  request (method, params, httpMethod = 'GET') {
    let url = this.getEngine().env('SDK_SERVER') + method;
    if (httpMethod === 'GET') {
      return this.doGet(url, params);
    } else {
      return this.doPost(url, params);
    }
  }

  requestStaticFile (url) {
    let v = `v=${this.getEngine().$moments.currentTime()}`;
    url += url.indexOf('?') > 0 ? `&${v}` : `?${v}`;
    return this.getEngine().$axios.get(
      url,
      {
        headers: {'Content-Type': 'application/json'}
      }
    ).then((ret) => {
      this.rpcCallComplete();
      return this.rpcCallSucc(ret);
    }).catch((error) => {
      this.rpcCallComplete();
      return this.rpcCallFail(error);
    });
  }

  doGet (method, params) {
    let paramsAdapter = this.rpcCallAdapter({url: method, data: params});
    return axios.get(paramsAdapter.url, {params: paramsAdapter.data}).then((ret) => {
      this.rpcCallComplete();
      return this.rpcCallSucc(ret);
    }).catch((error) => {
      this.rpcCallComplete();
      return this.rpcCallFail(error);
    });
  }

  doPost (method, params) {
    let paramsAdapter = this.rpcCallAdapter({url: method, data: params});
    return axios.post(paramsAdapter.url, qs.stringify(paramsAdapter.data)).then((ret) => {
      this.rpcCallComplete();
      return this.rpcCallSucc(ret);
    }).catch((error) => {
      this.rpcCallComplete();
      return this.rpcCallFail(error);
    });
  }

  /**
   * 请求发送前的适配器
   * @param request
   */
  rpcCallAdapter (request) {
    this[__rpcQueue].push(request);
    __showLoading.call(this);
    return __fillRequest.call(this, request);
  }

  /**
   * 请求发送成功
   * @param response
   */
  rpcCallSucc (response) {
    let result = new RpcCommandResult(response);
    if (this[__succDealer]) {
      return this[__succDealer](result);
    }
    return result;
  };

  /**
   * 请求发送失败
   * @param response
   */
  rpcCallFail (response) {
    this.getEngine().printf(response, '请求失败的处理');
    return response;
  }

  /**
   * 无论请求完成与否都执行
   * @param response
   */
  rpcCallComplete (response) {
    this[__rpcQueue].pop();
    if (this[__rpcQueue].length === 0) {
      __closeLoading.call(this);
    }
  }
}
