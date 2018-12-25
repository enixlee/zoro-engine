/**
 * Auth: lijiang
 * Date: 2018/3/20
 * Description: Utils
 */
import {Base} from '../common/Base';

export class Utils extends Base {
  install () {
    this.getEngine().registerPlugin('$utils', this);
  }

  /**
   * 附加属性
   * @param target
   * @param name
   * @param property
   * @param configurable
   */
  defineProperty (target, name, property, configurable = false) {
    Object.defineProperty(target, name, {
      configurable: configurable,
      value: property
    });
  }

  /**
   * 清空字典
   * @param map
   */
  clearMap (map) {
    if (!this.__lodash.isObject(map)) {
      return;
    }

    let keys = this.__lodash.keys(map);
    keys.forEach((v) => {
      delete map[v];
    });
  }

  arrayEach (arr, filter) {
    let list = [];
    arr.forEach((v, k) => {
      list.push(filter(v, k));
    });
    return list;
  }

  originName () {
    return 'engine.Utils';
  }
}
