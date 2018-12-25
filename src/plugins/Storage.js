/**
 * Auth: lijiang
 * Date: 2018/3/6
 * Description: Storage
 */
import {Base} from '../common/Base';

export class Storage extends Base {
  originName () {
    return 'engine.Storage';
  }

  isEnableEncrypt () {
    return this.getEngine().isProduct;
  }

  install () {
    this.getEngine().registerPlugin('$storage', this);
  }

  getCrypto () {
    return this.getEngine().$crypto;
  }

  /**
   * 存储器实例
   * @returns {*}
   */
  getStorageIns () {
    return window.localStorage;
  }

  /**
   * 加密key
   * @param key
   * @returns {*}
   */
  encodeStorageKey (key) {
    this.__assert.isStringNotEmpty(key);
    return this.isEnableEncrypt() ? this.getCrypto().MD5(key) : key;
  }

  /**
   * 加密存储的value
   * @param value
   * @returns {string}
   */
  encodeStorageValue (value) {
    this.__assert.isNotNil(value);
    let jsonData = JSON.stringify(value);
    return this.isEnableEncrypt() ? this.getCrypto().stringifyBase64(jsonData) : jsonData;
  }

  /**
   * 解密存储的value
   * @param storageValue
   * @returns {*}
   */
  decodeStorageValue (storageValue) {
    if (!this.__lodash.isString(storageValue)) {
      return storageValue;
    }

    return this.isEnableEncrypt() ? JSON.parse(this.getCrypto().parseBase64(storageValue)) : JSON.parse(storageValue);
  }

  getItem (key, D = null) {
    this.__assert.isString(key, `cache key invalid when been got, got ${key}`);

    try {
      let value = this.getStorageIns().getItem(this.encodeStorageKey(key));
      // 不处理boolean值
      return this.decodeStorageValue(value) || D;
    } catch (e) {
      return D;
    }
  }

  setItem (key, value) {
    this.__assert.isString(key, `cache key invalid when been set, got ${key}`);
    this.getStorageIns().setItem(this.encodeStorageKey(key), this.encodeStorageValue(value));
  }

  clearItem (key) {
    this.__assert.isString(key, `cache key invalid when been clear, got ${key}`);
    this.getStorageIns().removeItem(this.encodeStorageKey(key));
  }

  clearAll () {
    this.getStorageIns().clear();
  }
}
