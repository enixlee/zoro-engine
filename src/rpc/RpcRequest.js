/**
 * Auth: lijiang
 * Date: 2018/8/22
 * Description: RpcRequest
 */
import {ZoroModelBase} from '../store/model/ZoroModelBase';
import RpcRequestProtocol from './RpcRequestProtocol';

export class RpcRequest extends ZoroModelBase {
  init () {
    this.registerProtocol(RpcRequestProtocol);
  }

  request () {
    let params = this.makeParams(arguments || []);
    this.typeCheck(params);
    return this.doRequest(params);
  }
}
