/**
 * Auth: lijiang
 * Date: 2018/4/24
 * Description: Money
 */
import {Base} from '../common/Base';

export class Money extends Base {
  originName () {
    return 'engine.Money';
  }

  install () {
    this.getEngine().registerPlugin('$money', this);
  }

  /**
   * 分转元
   * @param cent
   * @returns {number}
   */
  cent2yuan (cent) {
    this.__assert.isNumber(cent, `money cent must be number, got ${cent}`);

    let money = parseFloat(cent) / 100;
    return money.toFixed(2); // 四舍五入
  }

  /**
   * 元转分
   * @param yuan
   * @returns {number}
   */
  yuan2cent (yuan) {
    this.__assert.isNumber(yuan, `money yuan must be number, got ${yuan}`);
    return parseInt(parseFloat(yuan) * 100 + 0.5);
  }

  /**
   * 折扣整数
   * @param discountRate
   * @returns {number}
   */
  discount (discountRate) {
    this.__assert.isNumber(discountRate, `money discountRate must be number, got ${discountRate}`);

    let base = discountRate / 10000 * 10;
    let discount = (base) % 10;
    if (base >= (discount + 0.1)) {
      return Math.floor((base * 100)) / 100;
    } else {
      return discount;
    }
  }

  /**
   * 折扣金额
   * @param money
   * @param discountRate
   * @returns {number}
   */
  getDiscountMoney (money, discountRate) {
    this.__assert.isNumber(discountRate, `money discountRate must be number, got ${discountRate}`);
    this.__assert.isNumber(money, `money must be number, got ${money}`);

    let discount = this.discount(discountRate);

    return money * discount / 10;
  }
}
