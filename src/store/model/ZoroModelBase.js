/**
 * Auth: lijiang
 * Date: 2018/12/26
 * Description: ZoroModelBase
 */
import {Base} from '../../common/Base';

const __modelTableName = Symbol('__modelTableName');
const __properties = Symbol('__properties');
const __appendAttributeFuncMap = Symbol('__appendAttributeFuncMap');
const __parentModel = Symbol('__parentModel');
const __objPool = Symbol('__objPool');

export class ZoroModelBase extends Base {
  constructor (modelName) {
    super();

    this[__appendAttributeFuncMap] = new Map();
    this[__modelTableName] = modelName;
    this[__objPool] = new Map();
    this[__parentModel] = null;
    this.reset();

    this.__lodash.map(this.appends(), (v) => {
      this.__assert.isTrue(!this.__lodash.has(this[__properties], v), `data and appends has the same key, model is ${modelName}, key is ${v}`);
    });
  }

  get isModel () {
    return true;
  }

  pluginInit () {
    this.init();
  }

  init () {
  }

  uniqueKey () {
    this.__assert.isTrue(false, `model ${this[__modelTableName]} has none unique key`);
  }

  uniqueValue () {
    let uuid = this.get(this.uniqueKey());
    if (uuid === undefined || uuid === null) {
      return this.uuid;
    }
    return uuid;
  }

  registerProtocol (protocol) {
    let self = super.registerProtocol(protocol);
    self.eventsOn();
    return self;
  }

  subjects () {
    return null;
  }

  eventsOn () {
    let subjects = this.subjects();
    if (this.__lodash.isObject(subjects)) {
      this.eventsOff();
      this.__lodash.map(subjects, (v, k) => {
        this.getEngine().$bus.on(k, this, v);
      });
    }
  }

  eventsOff () {
    let subjects = this.subjects();
    if (this.__lodash.isObject(subjects)) {
      this.__lodash.map(subjects, (v, k) => {
        this.getEngine().$bus.off(k, this, v);
      });
    }
  }

  originName () {
    return this[__modelTableName] || 'ModelBase';
  }

  data () {
    return {};
  }

  appends () {
    return [];
  }

  propertyTypeMap () {
    return {};
  }

  initFromArray (dataMap) {
    this[__objPool].clear();
    this.__assert.isObject(dataMap, `init model data map invalid, got ${dataMap}`);
    this.__lodash.map(dataMap, (v, k) => {
      this.set(k, v);
    });
    return this;
  }

  get (key) {
    if (this.__lodash.has(this[__properties], key)) {
      return this[__properties][key];
    }

    let appendFunc = this[__appendAttributeFuncMap].get(key);
    if (appendFunc) {
      return appendFunc.call(this);
    }

    appendFunc = this[`get${key}`];
    if (appendFunc) {
      this[__appendAttributeFuncMap].set(key, appendFunc);
      return appendFunc.call(this);
    }

    return null;
  }

  getOriginData (key) {
    return this[__properties][key];
  }

  setBelongsTo (model) {
    this[__parentModel] = model;
    return this;
  }

  getBelongsTo () {
    return this[__parentModel];
  }

  set (key, value) {
    this[__properties][key] = value;
    this.getEngine().$utils.defineProperty(
      this,
      key,
      value,
      true
    );

    return this;
  }

  differentIn (data) {
    return !this.__lodash.isEqual(this[__properties], data);
  }

  toArray () {
    return this[__properties];
  }

  reset () {
    let extendsData = this.__lodash.isFunction(this['extendsData']) ? this['extendsData'] : {};
    let data = this.data();
    let properties = this.__lodash.map(extendsData, (v, k) => {
      data[k] = v;
    });
    this[__properties] = properties;
  }

  getObjectFromPool (key) {
    return this[__objPool].get(key);
  }

  pushObjectToPool (key, model) {
    this[__objPool].set(key, model);
    return this;
  }

  clearObjectFromPool (key) {
    this[__objPool].delete(key);
  }

  tableCls () {
    this.__assert.isTrue(false, `model need implements this function`);
  }
}
