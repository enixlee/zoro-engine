/**
 * Auth: lijiang
 * Date: 2018/3/27
 * Description: KVStore
 */
import {Base} from '../common/Base';

const __KVMap = Symbol('__KVMap');

export class KVStore extends Base {
  originName () {
    return 'engine.KVStore';
  }

  concatKvMap (kvList) {
    if (!this.__lodash.isArray(kvList)) {
      return;
    }

    this.__lodash.map(kvList, (v, k) => {
      this[__KVMap][v.key] = v.value;
    });
  }

  pluginInit () {
    this[__KVMap] = {};
  }

  install () {
    this.getEngine().registerPlugin('$kv', this);
  }

  setItem (k, v) {
    this.__assert.isString(k, `KV k invalid of setItem, got ${k}`);
    this[__KVMap][k] = v;
  }

  getItem (k, D = null) {
    this.__assert.isString(k, `KV k invalid of getItem, got ${k}`);
    return this[__KVMap][k] || D;
  }

  clearItem (k) {
    this.__assert.isString(k, `KV k invalid of clearItem, got ${k}`);
    delete this[__KVMap][k];
  }

  clear () {
    this[__KVMap] = {};
  }
}
