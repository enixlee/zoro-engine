/**
 * Auth: lijiang
 * Date: 2018/3/7
 * Description: Store
 */
import {Base} from '../common/Base';
import {createStore, applyMiddleware} from 'redux';
import promiseMiddleware from 'redux-promise';
import {ModuleManager} from './module/ModuleManager';
import {createAction} from 'redux-actions';
import {setStore} from 'wepy-redux';
import {BALA_DISPATCHER_PREFIX} from './Constants';

const __dispatcher = Symbol('__dispatcher');

export class Store extends Base {
  pluginInit () {
    this[__dispatcher] = null;
  }

  install (modules) {
    this.getEngine().use(new ModuleManager());
    this.getEngine().$moduleMgr.registerModules(modules);
    let store = this.buildStoreIns();
    this.getEngine().registerPlugin('$store', store);
  }

  /**
   * 创建store
   * @returns {Store<any>}
   */
  buildStoreIns () {
    let combineReducers = this.getEngine().$moduleMgr.combineModuleReducers();
    let store = createStore(combineReducers, applyMiddleware(promiseMiddleware));

    if (!this.__lodash.isFunction(this[__dispatcher])) {
      this[__dispatcher] = store.dispatch;
    }
    store.dispatch = (subject, ...args) => {
      if (this.__lodash.isObject(subject) && subject.type.indexOf(BALA_DISPATCHER_PREFIX) === 0) {
        this[__dispatcher](subject);
      } else {
        let type = subject;
        if (this.__lodash.isObject(subject)) {
          type = subject.type;
        }
        let action = this.__createDispatchAction(store, type);
        return store.dispatch(action(...args));
      }
    };

    let plugins = this.getEngine().getPlugins();
    this.__lodash.map(plugins, (plugin, name) => {
      this.getEngine().$utils.defineProperty(store, name, plugin);
    });

    this.getEngine().$utils.defineProperty(
      store,
      'getStoreState',
      (moduleName) => {
        return store.getState()[moduleName];
      });

    this.getEngine().$utils.defineProperty(
      store,
      'getGetterNamed',
      (getterName) => {
        let getter = this.getEngine().$moduleMgr.getters()[getterName];
        this.__assert.isObject(getter, `getter is not exist, name is ${getterName}`);
        return getter.g.call(getter.m, getter.m.state);
      });

    setStore(store);

    return store;
  }

  /**
   * 创建action
   * @param store
   * @param subject
   * @private
   */
  __createDispatchAction (store, subject) {
    let handler = this.getEngine().$moduleMgr.getAction(subject);
    let module = this.getEngine().$moduleMgr.getModuleByAction(subject);
    let type = `${BALA_DISPATCHER_PREFIX}${subject}`;
    return createAction(type, (...args) => {
      return handler.call(module, module, module.state, ...args);
    });
  }
}
