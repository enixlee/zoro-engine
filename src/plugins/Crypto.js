/**
 * Auth: lijiang
 * Date: 2018/3/5
 * Description: Crypto
 */
import md5 from 'crypto-js/md5';
import base64 from 'crypto-js/enc-base64';
import Hex from 'crypto-js/enc-hex';
import {Base} from '../common/Base';

export class Crypto extends Base {
  originName () {
    return 'engine.Crypto';
  }

  hex2String (strInput) {
    let nInputLength = strInput.length;
    this.__assert.isTrue(nInputLength % 4 === 0, `input hex string not valid, got ${strInput}`);
    // 考虑中文，固定占位4位
    let StrHex = '';
    for (let i = 0; i < nInputLength; i = i + 4) {
      let str = strInput.substr(i, 4);
      let n = parseInt(str, 16);
      StrHex += String.fromCharCode(n);
    }
    return StrHex;
  }

  /**
   * 字符串转成16进制串（每个字符占4位，不足4位前面补0）
   * @param inputStr
   * @returns {string}
   */
  stringToHex (inputStr) {
    let val = '';
    for (let i = 0; i < inputStr.length; i++) {
      let char = inputStr.charCodeAt(i).toString(16);
      while (char.length < 4) {
        char = '0' + char;
      }
      if (val === '') {
        val = char;
      } else {
        val += char;
      }
    }
    return val;
  }

  /**
   * md5加密
   * @param message
   * @returns {string}
   * @constructor
   */
  MD5 (message) {
    this.__assert.isStringNotEmpty(message);
    let md5Msg = md5(message);
    return md5Msg + '';
  }

  /**
   * base64解压缩
   * @param base64String
   * @returns {string}
   */
  parseBase64 (base64String) {
    this.__assert.isStringNotEmpty(base64String);
    let base64Decode = base64.parse(base64String);
    let hexDecode = Hex.stringify(base64Decode);
    return this.hex2String(hexDecode);
  }

  /**
   * base64压缩
   * @param message
   */
  stringifyBase64 (message) {
    this.__assert.isStringNotEmpty(message);
    let hexStr = this.stringToHex(message);
    let hexEncode = Hex.parse(hexStr);
    return base64.stringify(hexEncode);
  }

  install () {
    this.getEngine().registerPlugin('$crypto', this);
  }
}
