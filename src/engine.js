/**
 * Auth: lijiang
 * Date: 2018/2/12
 * Description: engine
 */
import Vue from 'vue';
import {ENGINE_NAME, ENGINE_VERSION} from './constants/Common';
import {Includes} from './includes';
import {Env} from './plugins/Env';
import _ from 'lodash';
import {Asserts} from './plugins/Asserts';
import {Utils} from './plugins/Utils';

const __usePlugins = Symbol('__usePlugins');
const __curPluginList = Symbol('__curPluginList');

window.getVue = () => {
  return Vue;
};

export class engine {
  constructor (env) {
    this[__curPluginList] = {};
    this[__usePlugins] = {};

    Vue.prototype.getEngine = () => {
      return this;
    };

    this.__registerPlugin('$lodash', _);
    this.__registerPlugin('$assert', new Asserts());
    this.__registerPlugin('$engine', this);

    this.registerPlugin('registerPlugin', this.registerPlugin);
    this.registerPlugin('unRegisterPlugin', this.unRegisterPlugin);

    this.use(new Utils());

    // 注册引擎组件
    this.use(new Env(), env);
    this.use(new Includes());
    this.$envMgr.loadFromCache();
    if (!this.isProduct) {
      this.printf(this.description());
    }
  }

  get isEngine () {
    return true;
  }

  use (obj, ...arg) {
    this.$assert.isTrue(obj.$isBalaObject, `engine use plugin must be bala object, got ${obj}`);

    obj.install(...arg);
    this[__usePlugins][obj.name] = obj;
  }

  env (name) {
    this.$assert.isString(name, `engine env key name must be string ,got ${name}`);
    let ins = this;
    if (!(ins.isEngine)) {
      // 非engine
      ins = ins.getEngine();
    }
    return ins.__getEnvValue(name);
  }

  /**
   * 注册插件
   * @param name
   * @param plugin
   */
  registerPlugin (name, plugin) {
    this.$assert.isString(name, `engine plugin name must be string ,got ${name}`);
    this.$assert.isNotNil(plugin, `plugin must not be nil`);

    let ins = this;
    if (!(ins.isEngine)) {
      // 非engine
      ins = ins.getEngine();
    }
    ins.__registerPlugin(name, plugin);
  }

  /**
   * 剔除插件
   * @param name
   */
  unRegisterPlugin (name) {
    if (!(_.isFunction(this.isEngine) && this.isEngine())) {
      // 其它组件卸载自己
      if (this.hasOwnProperty(name)) {
        delete this[name];
      }
    } else {
      // engine卸载全部
      this.__unRegisterPlugin();
    }
  }

  __registerPlugin (name, plugin) {
    Vue.prototype[name] = plugin;
    if (!this.hasOwnProperty(name)) {
      this[name] = plugin;
    }
    if (!this[__curPluginList].hasOwnProperty(name)) {
      this[__curPluginList][name] = plugin;
    }
  }

  __unRegisterPlugin (name) {
    if ((this.hasOwnProperty(name))) {
      delete this[name];
    }
    if (this[__curPluginList].hasOwnProperty(name)) {
      delete this[__curPluginList][name];
    }
  }

  __getEnvValue (envKey) {
    let engine = this.$env['engine'];
    if (engine.hasOwnProperty(envKey)) {
      return engine[envKey];
    }
    let project = this.$env['project'];
    if (project.hasOwnProperty(envKey)) {
      return project[envKey];
    }
    return null;
  }

  getPlugins () {
    return this[__curPluginList];
  }

  toString () {
    return ENGINE_NAME;
  }

  description () {
    return `engine ${ENGINE_NAME} run, version: ${ENGINE_VERSION}`;
  }

  getVue () {
    return Vue;
  }

  start (appRun) {
    return appRun();
  }
}
