/**
 * Auth: lijiang
 * Date: 2018/3/7
 * Description: ModuleManager
 */
import {combineReducers} from 'redux';
import {handleActions} from 'redux-actions';
import {BALA_DISPATCHER_PREFIX, STORE_STATE_CHANGED, STATE_PARAM_PREFIX} from '../Constants';
import {Base} from '../../common/Base';

const __originModules = Symbol('__originModules');
const __moduleByAction = Symbol('__moduleByAction');
const __getters = Symbol('__getters');
const __actions = Symbol('__actions');
const __reducers = Symbol('__reducers');

/**
 * 初始化state
 * @param moduleName
 * @param originState
 * @returns {*}
 * @private
 */
function __initModuleCachedData (moduleName, originState) {
  let cacheData = this.getEngine().$dataCache.getModule(moduleName);
  if (cacheData) {
    cacheData.cached = originState.cached || false;
    originState = cacheData;
  }

  return originState;
}

/**
 * 构建state初始结构
 * @param moduleName
 * @param state
 * @returns {{}}
 * @private
 */
function __makeStateValue (moduleName, state) {
  let newState = {};
  let keys = this.__lodash.keys(state);
  this.__lodash.map(keys, (key) => {
    newState[`${STATE_PARAM_PREFIX}${key}`] = state[key];
  });

  this.__lodash.map(keys, (key) => {
    newState.__defineGetter__(key, () => {
      return newState[`${STATE_PARAM_PREFIX}${key}`];
    });

    newState.__defineSetter__(key, (val) => {
      newState[`${STATE_PARAM_PREFIX}${key}`] = val;
      if (newState.cached) {
        this.getEngine().$bus.emit(STORE_STATE_CHANGED, moduleName, key, val);
      }
    });
  });

  return newState;
}

/**
 * 定义module插件
 * @param module
 * @private
 */
function __insertPlugin2Module (module) {
  // 插入参数
  let plugins = {
    '$lodash': this.getEngine().$lodash,
    '$assert': this.getEngine().$assert,
    'eventBus': this.getEngine().$bus,
    'rpc': this.getEngine().$rpc,
    '$moments': this.getEngine().$moments,
    '$engine': this.getEngine(),
    'getEngine': () => {
      return this.getEngine();
    }
  };

  this.getEngine().$lodash.map(plugins, (plugin, k) => {
    this.getEngine().$utils.defineProperty(module, k, plugin);
  });
}

export class ModuleManager extends Base {
  install () {
    this.getEngine().registerPlugin('$moduleMgr', this);
  }

  modules () {
    return this[__originModules];
  }

  getters () {
    return this[__getters];
  }

  registerModules (modules) {
    this.__lodash.isObject(modules, `modules need to be registered invalid, got ${modules}`);
    this[__originModules] = modules;

    let actions = {};
    let reducers = {};
    let getters = {};

    this[__moduleByAction] = {};

    this.__lodash.map(modules, (module, name) => {
      this.__lodash.isObject(module.actions, `module actions invalid, name is ${name}`);
      this.__lodash.isObject(module.reducers, `module reducers invalid, name is ${name}`);

      // 插入属性
      __insertPlugin2Module.call(this, module);

      // 初始化state数据
      module.state = __makeStateValue.call(this, name, __initModuleCachedData.call(this, name, module.state));

      // actions
      let rebuildActions = {};
      this.__lodash.map(module.actions, (action, actionK) => {
        let key = `${BALA_DISPATCHER_PREFIX}${actionK}`;
        rebuildActions[key] = action;
        this[__moduleByAction][key] = module;
      });

      actions = {
        ...actions,
        ...rebuildActions
      };

      // reducers
      let rebuildReducers = {};
      this.__lodash.map(module.reducers, (reducer, reducerK) => {
        let key = `${BALA_DISPATCHER_PREFIX}${reducerK}`;
        rebuildReducers[key] = (s, action) => {
          reducer.call(module, s, action.payload);
          if (s.cached) {
            // 计入缓存
            this.getEngine().$dataCache.flush();
          }
          return s;
        };
      });
      reducers[name] = handleActions(rebuildReducers, module.state);

      // getters
      let moduleGetters = module.getters || {};
      this.__lodash.map(moduleGetters, (v, k) => {
        getters[k] = {m: module, g: v};
      });
    });

    this[__getters] = getters;
    this[__actions] = actions;
    this[__reducers] = reducers;
  }

  /**
   * 创建reducers
   * @returns {Reducer<any>}
   */
  combineModuleReducers () {
    return combineReducers(this[__reducers]);
  }

  /**
   * 查找action
   * @param subject
   * @returns {*}
   */
  getAction (subject) {
    this.__lodash.isFunction(this[__actions][subject], `has none this action, subject is ${subject}`);

    return this[__actions][`${BALA_DISPATCHER_PREFIX}${subject}`];
  }

  /**
   * 根据subject获取module
   * @param subject
   * @returns {{}}
   */
  getModuleByAction (subject) {
    this.__lodash.isString(subject, `has none this action to get module, subject is ${subject}`);
    if (subject.indexOf(BALA_DISPATCHER_PREFIX) < 0) {
      subject = `${BALA_DISPATCHER_PREFIX}${subject}`;
    }
    return this[__moduleByAction][subject];
  }

  getModule (name) {
    return this[__originModules][name];
  }
}
