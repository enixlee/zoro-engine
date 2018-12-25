/**
 * Auth: lijiang
 * Date: 2018/3/23
 * Description: IDGenerator
 */
import {Base} from '../common/Base';

const __ticksMap = Symbol('__ticksMap');

export class IDGenerator extends Base {
  originName () {
    return 'engine.IDGenerator';
  }

  pluginInit () {
    this[__ticksMap] = {};
  }

  install () {
    this.getEngine().registerPlugin('$idGenerator', this);
  }

  generateId (type) {
    let generator = this[__ticksMap][type];
    if (generator) {
      this[__ticksMap][type] = ++generator;
    } else {
      let id = new Date();
      this[__ticksMap][type] = ++id;
    }
    return this[__ticksMap][type];
  }

  autoIncreasing (type, D = 1) {
    let generator = this[__ticksMap][type];
    if (generator) {
      this[__ticksMap][type] = ++generator;
    } else {
      this[__ticksMap][type] = D;
    }
    return this[__ticksMap][type];
  }
}
