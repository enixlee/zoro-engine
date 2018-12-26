/**
 * Auth: lijiang
 * Date: 2018/8/13
 * Description: RpcRequest
 */
import {createResponse, RpcCommandResult} from './RpcCommandResult';

const RpcRequestProtocol = {
  getMethod () {
    return this.get('routeUrl');
  },

  needAuth () {
    return this.get('auth');
  },

  getRpcType () {
    return this.get('method');
  },

  originName () {
    return this.getMethod();
  },

  getScope () {
    return this.get('scope');
  },

  callRemote (params, token) {
    let url = this.getMethod();
    if (token) {
      // params['userToken'] = token;
      url += `?userToken=${token}`;
    }
    if (!this.getEngine().isProduct && this.getEngine().$rpc.mockEnable(this)) {
      return this.getEngine().$rpc.mock(this).then((payload) => {
        return payload.setRequest(params);
      });
    } else {
      return this.getEngine().$rpc.request(url, params, this.getEngine().isProduct ? this.getRpcType() : 'GET').then((payload) => {
        return payload.setRequest(params);
      });
    }
  },

  doRequest (params) {
    if (this.needAuth()) {
      let userToken = this.getEngine().getGetterNamed('token');
      if (this.getEngine().$lodash.isString(userToken) && userToken.length > 0) {
        return this.callRemote(params, userToken);
      } else {
        return new Promise(resolve => {
          resolve(new RpcCommandResult(this.getEngine(), createResponse(this.getMethod(), false, 'USER_TOKEN_INVALID', {})));
        });
      }
    } else {
      return this.callRemote(params);
    }
  },

  typeCheck (params) {
    let parameters = this.get('parameters');
    this.__lodash.map(parameters, (v, k) => {
      v.typeCheck(this.getEngine(), params[k]);
    });
  },

  makeParams (argsList) {
    let parameters = this.get('parameters');
    let params = {};
    let cursor = 0;
    this.__lodash.map(parameters, (v, k) => {
      let realValue = argsList[cursor];
      cursor++;
      if (realValue === undefined) {
        if (v.hasOwnProperty('default')) {
          params[k] = v.default;
        }
      } else {
        params[k] = realValue;
      }

      if (params[k] === null || params[k] === undefined) {
        delete params[k];
      }
    });

    return params;
  }
};

export default RpcRequestProtocol;
