/**
 * Auth: lijiang
 * Date: 2018/3/14
 * Description: LanguageEngine
 */
import {Base} from '../common/Base';
import VueI18n from 'vue-i18n';

const __locale = Symbol('__locale');

function getCurrentLangMap () {
  let type = this.getLangType();
  let message = this[__locale][type];
  let map = {};
  map[type] = message;
  return map;
}

export class LanguageEngine extends Base {
  originName () {
    return 'engine.Moments';
  }

  install (locale = {}) {
    this[__locale] = locale;
    let Vue = this.getEngine().getVue();
    Vue.use(VueI18n);

    let langConfig = {
      locale: this.getLangType(),
      messages: getCurrentLangMap.call(this)
    };
    this.getEngine().registerPlugin('$langMgr', this);
    this.getEngine().registerPlugin('$langEngine', new VueI18n(langConfig));
  }

  fetchMessages (langMap) {
    let type = this.getLangType();
    this.getEngine().$langEngine.mergeLocaleMessage(type, langMap[type] || {});
  }

  getLangType () {
    return this.getEngine().env('LANGUAGE');
  }

  pluginInit () {
    this.getEngine().registerPlugin('getLang', (langKey, params) => {
      return this.getLang(langKey, params);
    });
    this.getEngine().registerPlugin('hasLangKey', (langKey) => {
      return this.hasLangKey(langKey);
    });
  }

  /**
   * 是否定义了语言key
   * @param key
   * @returns {void|boolean|*|{$deprecated, since, replacedBy}}
   */
  hasLangKey (key) {
    let langType = this.getLangType();
    let langMap = this[__locale][langType];
    return this.__lodash.isString(langMap[key]);
  }

  /**
   * 获取语言配置
   * @param languageKey
   * @param replaceKv
   * @returns {*}
   */
  getLang (languageKey, replaceKv = null) {
    let langType = this.getLangType();
    let langMap = this[__locale][langType];
    this.__assert.isObject(langMap, `language map of ${langType} not exist`);
    let lang = this[__locale][langType][languageKey];
    this.__assert.isString(lang, `language key not exist, got ${languageKey}`);

    let appName = this.getEngine().env('APP_NAME');

    let unit = this.getEngine().$langEngine.t('UNIT');

    if (replaceKv) {
      replaceKv['unit'] = unit;
      replaceKv['appName'] = appName;
    } else {
      replaceKv = {unit: unit, appName: appName};
    }

    return this.getEngine().$langEngine.t(languageKey, replaceKv);
  }

}
