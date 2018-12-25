/**
 * Auth: lijiang
 * Date: 2018/2/28
 * Description: Env
 */
import {Base} from '../common/Base';
import {ENGINE_ENV_DEBUG, ENGINE_ENV_TEST, ENGINE_ENV_PRODUCT} from '../constants/Common';

const __env = Symbol('__env');

const __cache = Symbol('__cache');
const ENV_CACHE_KEY = 'env';

function getStorageKey () {
  return (this.getEngine().env('PROJECT_NAME') || '') + `_${ENV_CACHE_KEY}`;
}

function setKey (key, value) {
  this[__cache][key] = value;
  this.getEngine().$storage.setItem(getStorageKey.call(this), this[__cache]);
}

export class Env extends Base {
  install (env) {
    this[__env] = env;
    this.getEngine().registerPlugin('$env', this[__env]);
    this.getEngine().registerPlugin('isDebug', this.getEngine().env('PLATFORM_ENV') === ENGINE_ENV_DEBUG);
    this.getEngine().registerPlugin('isTest', this.getEngine().env('PLATFORM_ENV') === ENGINE_ENV_TEST);
    this.getEngine().registerPlugin('isProduct', this.getEngine().env('PLATFORM_ENV') === ENGINE_ENV_PRODUCT);
    this.getEngine().registerPlugin('$envMgr', this);
  }

  originName () {
    return 'engine.env';
  }

  loadFromCache () {
    this[__cache] = this.getEngine().$storage.getItem(getStorageKey.call(this), {
      RES_VERSION: this.getEngine().env('RES_VERSION'),
      CONFIG_VERSION: this.getEngine().env('CONFIG_VERSION'),
      WEB_VERSION: this.getEngine().env('WEB_VERSION')
    });
  }

  setResourceVersion (resVer) {
    setKey.call(this, 'RES_VERSION', resVer);
  }

  setConfigVersion (configVersion) {
    setKey.call(this, 'CONFIG_VERSION', configVersion);
  }

  setWebVersion (version) {
    setKey.call(this, 'WEB_VERSION', version);
  }

  getResourceVersion () {
    return this[__cache]['RES_VERSION'];
  }

  getConfigVersion () {
    return parseInt(this[__cache]['CONFIG_VERSION']);
  }

  getWebVersion () {
    return this[__cache]['WEB_VERSION'];
  }

  getStaticResourceVersion () {
    return this[__cache]['STATIC_RES_VERSION'];
  }

  setStaticResourceVersion (resVer) {
    setKey.call(this, 'STATIC_RES_VERSION', resVer);
  }
}
