import {Base} from '../common/Base';

export class TypeCheck extends Base {
  originName () {
    return 'engine.TypeCheck';
  }

  install () {
    this.getEngine().registerPlugin('$typeCheck', this);
  }

  /**
   * 扩展
   * @param typeCheckExtends
   */
  extendTypeCheck (typeCheckExtends) {
    this.__assert.isTrue(this.__lodash.isFunction(typeCheckExtends), `typeCheck extends must be function, got ${typeCheckExtends}`);
    this.getEngine().$utils.defineProperty(this, typeCheckExtends.name, typeCheckExtends, false);
  }

  isNil (value) {
    return this.__lodash.isNull(value) || this.__lodash.isUndefined(value);
  }

  /**
   * 手机号
   * @param value
   * @returns {boolean}
   */
  isCellphone (value) {
    let reg = new RegExp('^13[\\d]{9}$|^14[5,7]{1}\\d{8}$|^15[^4]{1}\\d{8}$|^17[0,1,6,7,8]{1}\\d{8}$|^18[\\d]{9}$');
    return reg.test(value);
  }

  /**
   * md5
   * @param value
   * @returns {boolean}
   */
  isMD5 (value) {
    let reg = new RegExp('[0-9a-fA-F]{32}');
    return reg.test(value);
  }

  /**
   * md5_16
   * @param value
   * @returns {boolean}
   */
  isMD5OfLength16 (value) {
    let reg = new RegExp('[a-fA-F0-9]{16}');
    return reg.test(value);
  }

  /**
   * 日期格式 YYYY-MM-DD h:i:s
   * @param value
   * @returns {boolean}
   */
  isDateTime (value) {
    if (!this.__lodash.isString(value)) {
      return false;
    }

    let dateParts = this.__lodash.words(value);

    let year = parseInt(dateParts[0]);
    if (!(this.__lodash.isNumber(year) && year >= 1970 && year <= 2100)) {
      return false;
    }

    let month = parseInt(dateParts[1]);
    if (!(this.__lodash.isNumber(month) && month >= 1 && month <= 12)) {
      return false;
    }

    let day = parseInt(dateParts[2]);
    if (!(this.__lodash.isNumber(day) && day >= 1 && day <= 31)) {
      return false;
    }

    let hour = parseInt(dateParts[3]);
    if (!(this.__lodash.isNumber(hour) && hour >= 0 && hour <= 23)) {
      return false;
    }

    let minute = parseInt(dateParts[4]);
    if (!(this.__lodash.isNumber(minute) && minute >= 0 && minute <= 59)) {
      return false;
    }

    let second = parseInt(dateParts[5]);
    if (!(this.__lodash.isNumber(second) && second >= 0 && second <= 59)) {
      return false;
    }

    return true;
  }

  /**
   * 是否是身份证
   * @param idCard
   * @returns {boolean}
   */
  isIdNo (idCard) {
    // 15位和18位身份证号码的正则表达式
    let reg = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
    if (reg.test(idCard)) {
      if (idCard.length === 18) {
        // 将前17位加权因子保存在数组里
        let idCardWi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        // 这是除以11后，可能产生的11位余数、验证码，也保存成数组
        let idCardY = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2];
        // 用来保存前17位各自乖以加权因子后的总和
        let idCardWiSum = 0;
        for (let i = 0; i < 17; i++) {
          idCardWiSum += idCard.substring(i, i + 1) * idCardWi[i];
        }

        // 计算出校验码所在数组的位置
        let idCardMod = idCardWiSum % 11;

        // 如果等于2，则说明校验码是10，身份证号码最后一位应该是X
        if (idCardMod === 2) {
          let idCardLast = idCard.substring(17);
          return idCardLast === 'X' || idCardLast === 'x';
        } else {
          let idCardLast = parseInt(idCard.substring(17));
          // 用计算出的验证码与最后一位身份证号码匹配，如果一致，说明通过，否则是无效的身份证号码
          return idCardLast === parseInt(idCardY[idCardMod]);
        }
      }
    } else {
      return false;
    }
    return true;
  }

  /**
   * 大整数
   * @param value
   * @param nullEnable
   * @returns {null}
   */
  typeCheckBigint (value, nullEnable = false) {
    if (nullEnable && this.isNil(value)) {
      return null;
    }

    this.__assert.isTrue(this.__lodash.isString(value) || this.__lodash.isNumber(value));
  }

  /**
   * 数字检测
   * @param value
   * @param min
   * @param max
   * @param nullEnable
   * @returns {null}
   */
  typeCheckNumber (value, min = null, max = null, nullEnable = false) {
    if (nullEnable && this.isNil(value)) {
      return null;
    }
    this.__assert.isNumber(value);

    if (this.__lodash.isNull(min) && this.__lodash.isUndefined(min)) {
      this.__assert.gte(value, min);
    }

    if (this.__lodash.isNull(max) && this.__lodash.isUndefined(max)) {
      this.__assert.lte(value, max);
    }
  }

  /**
   * 字符串检测
   * @param value
   * @param min
   * @param max
   * @param nullEnable
   * @returns {null}
   */
  typeCheckString (value, min = null, max = null, nullEnable = false) {
    if (nullEnable && this.isNil(value)) {
      return null;
    }
    this.__assert.isString(value);

    if (this.__lodash.isNull(min) && this.__lodash.isUndefined(min)) {
      this.__assert.gte(value.length, min);
    }

    if (this.__lodash.isNull(max) && this.__lodash.isUndefined(max)) {
      this.__assert.lte(value.length, max);
    }
  }

  /**
   * json串检测
   * @param value
   * @param nullEnable
   * @returns {null}
   */
  typeCheckJsonString (value, nullEnable = false) {
    if (nullEnable && this.isNil(value)) {
      return null;
    }

    this.__assert.isJsonString(value);
  }

  /**
   * json的choice
   * @param value
   * @param choice
   * @param nullEnable
   * @returns {null}
   */
  typeCheckJsonArrayChoice (value, choice, nullEnable = false) {
    if (nullEnable && this.isNil(value)) {
      return null;
    }

    this.__assert.isJsonString(value);

    let jsonObj = JSON.parse(value);
    this.__lodash.map(jsonObj, (n) => {
      this.__assert.inChoice(n, choice);
    });
  }

  /**
   * 选项检测
   * @param value
   * @param choice
   * @param nullEnable
   * @returns {null}
   */
  typeCheckChoice (value, choice, nullEnable = false) {
    if (nullEnable && this.isNil(value)) {
      return null;
    }

    this.__assert.inChoice(value, choice);
  }

  /**
   * 数组检测
   * @param value
   * @param nullEnable
   * @returns {null}
   */
  typeCheckArray (value, nullEnable = false) {
    if (nullEnable && this.isNil(value)) {
      return null;
    }

    this.__assert.isArray(value);
  }

  /**
   * userId
   * @param value
   * @param nullEnable
   * @returns {null}
   */
  typeCheckUserId (value, nullEnable = false) {
    if (nullEnable && this.isNil(value)) {
      return null;
    }

    this.typeCheckString(value, null, 64, nullEnable);
  }

  /**
   * guid
   * @param value
   * @param nullEnable
   * @returns {null}
   */
  typeCheckGuid (value, nullEnable = false) {
    if (nullEnable && this.isNil(value)) {
      return null;
    }

    this.typeCheckString(value, 32, 64, nullEnable);
  }

  /**
   * 日期检测
   * @param value
   * @param nullEnable
   * @returns {null}
   */
  typeCheckDateString (value, nullEnable = false) {
    if (nullEnable && this.isNil(value)) {
      return null;
    }

    this.__assert.isString(value, `date string is invalid, got ${value}`);

    let dateParts = this.__lodash.words(value);

    this.__assert.isArray(dateParts, `date string is invalid, got ${value}`);
    this.__assert.isTrue(dateParts.length === 6, `date string is invalid, got ${value}`);

    this.typeCheckNumber(parseInt(dateParts[0]), 1970, 9999);
    this.typeCheckNumber(parseInt(dateParts[1]), 1, 12);
    this.typeCheckNumber(parseInt(dateParts[2]), 1, 31);
    this.typeCheckNumber(parseInt(dateParts[3]), 0, 23);
    this.typeCheckNumber(parseInt(dateParts[4]), 0, 59);
    this.typeCheckNumber(parseInt(dateParts[5]), 0, 59);
  }

  /**
   * 手机号检测
   * @param value
   * @param nullEnable
   * @returns {null}
   */
  typeCheckCellphone (value, nullEnable = false) {
    if (nullEnable && this.isNil(value)) {
      return null;
    }

    this.__assert.isString(value, `cellphone number is invalid, got ${value}`);

    this.__assert.isTrue(this.isCellphone(value), `cellphone number is invalid, got ${value}`);
  }

  /**
   * md5检测
   * @param value
   * @param nullEnable
   * @returns {null}
   */
  typeCheckMd5 (value, nullEnable = false) {
    if (nullEnable && this.isNil(value)) {
      return null;
    }

    this.__assert.isTrue(this.__lodash.isString(value) && this.isMD5(value), `md5 string invalid, got ${value}`);
  }

  /**
   * md5_16检测
   * @param value
   * @param nullEnable
   * @returns {null}
   */
  typeCheckMd5OfLength16 (value, nullEnable = false) {
    if (nullEnable && this.isNil(value)) {
      return null;
    }

    this.__assert.isTrue(this.__lodash.isString(value) && this.isMD5OfLength16(value), `md5_16 string invalid, got ${value}`);
  }

  /**
   * 状态检测
   * @param value
   * @param nullEnable
   * @returns {null}
   */
  typeCheckStatus (value, nullEnable = false) {
    if (nullEnable && this.isNil(value)) {
      return null;
    }

    this.typeCheckChoice(value, [0, 1, 2, 3, 4], nullEnable);
  }

  /**
   * 万分比检测
   * @param value
   * @param nullEnable
   * @returns {null}
   */
  typeCheckRatio (value, nullEnable = false) {
    if (nullEnable && this.isNil(value)) {
      return null;
    }

    this.typeCheckNumber(value, 0, 10000, nullEnable);
  }

  /**
   * 身份证检测
   * @param value
   * @param nullEnable
   * @returns {null}
   */
  typeCheckIdNo (value, nullEnable = false) {
    if (nullEnable && this.isNil(value)) {
      return null;
    }

    this.__assert.isTrue(this.isIdNo(value), `id no invalid, got ${value}`);
  }
}
