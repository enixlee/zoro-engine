/**
 * Auth: lijiang
 * Date: 2018/8/22
 * Description: RpcRequest
 */
import {ModelBase} from '@/store/Model/ModelBase';
import RpcRequestProtocol from './RpcRequestProtocol';

export class RpcRequest extends ModelBase {
  init () {
    this.registerProtocol(RpcRequestProtocol);
  }

  request () {
    let params = this.makeParams(arguments || []);
    this.typeCheck(params);
    return this.doRequest(params);
  }
}
