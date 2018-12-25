/**
 * Auth: lijiang
 * Date: 2018/3/6
 * Description: EventBus
 */
import {Base} from '../common/Base';

const __subscribers = Symbol('__subscribers');
const __once = Symbol('__once');

/**
 * 解除事件注册
 * @param event
 * @param target
 * @param handler
 * @private
 */
function __offSubscribeEvent (event, target, handler) {
  if (!this[__subscribers].hasOwnProperty(event)) {
    this[__subscribers][event] = {};
  }
  let handlers = this[__subscribers][event] || {};
  if (handlers.hasOwnProperty(target._uid)) {
    delete handlers[target._uid];
  }
  if (this.__lodash.keys(handlers).length === 0) {
    delete this[__subscribers][event];
  } else {
    this[__subscribers][event] = handlers;
  }
}

/**
 * 解除一次性事件注册
 * @param event
 * @param target
 * @param handler
 * @private
 */
function __offOnceEvent (event, target, handler) {
  if (!this[__once].hasOwnProperty(event)) {
    this[__once][event] = {};
  }
  let handlers = this[__once][event];
  if (handlers.hasOwnProperty(target._uid)) {
    delete handlers[target._uid];
  }
  if (this.__lodash.keys(handlers).length === 0) {
    delete this[__once][event];
  } else {
    this[__once][event] = handlers;
  }
}

/**
 * 触发事件
 * @param event
 * @param args
 * @private
 */
function __fireSubscribeEvent (event, ...args) {
  if (!this[__subscribers].hasOwnProperty(event)) {
    this[__subscribers][event] = {};
  }
  let handlers = this[__subscribers][event];
  this.__lodash.map(handlers, (e) => {
    e.h.call(e.t, ...args);
  });
}

/**
 * 触发一次性事件
 * @param event
 * @param args
 * @private
 */
function __fireOnceEvent (event, ...args) {
  if (!this[__once].hasOwnProperty(event)) {
    this[__once][event] = {};
  }
  let handlers = this[__once][event];
  this.__lodash.map(handlers, (e) => {
    e.h.call(e.t, ...args);
  });

  delete this[__once][event];
}

export class EventBus extends Base {
  originName () {
    return 'engine.EventBus';
  }

  install () {
    this.getEngine().registerPlugin('$bus', this);
    this.getEngine().registerPlugin('eventBus', this);
  }

  pluginInit () {
    this[__subscribers] = {};
    this[__once] = {};
  }

  /**
   * 注册事件
   * @param event
   * @param target
   * @param handler
   * @returns {EventBus}
   */
  on (event, target, handler) {
    this.__assert.isStringNotEmpty(event, `subscriber on a invalid event, got ${event}`);
    this.__assert.isFunction(handler, `subscriber on a invalid handler, got ${handler}`);

    if (!this[__subscribers].hasOwnProperty(event)) {
      this[__subscribers][event] = {};
    }

    let handlers = this[__subscribers][event];
    // 同一个target的同一种事件，不允许未注销状态下连续注册
    this.__assert.isTrue(!this.__lodash.has(handlers, target._uid), `subscriber event ${event} on a handler that exist, got ${target._uid}`);

    handlers[target._uid] = {h: handler, t: target};
    this[__subscribers][event] = handlers;

    return this;
  }

  /**
   * 单次注册事件
   * @param event
   * @param target
   * @param handler
   * @returns {EventBus}
   */
  once (event, target, handler) {
    this.__assert.isStringNotEmpty(event, `subscriber on a invalid once event, got ${event}`);
    this.__assert.isFunction(handler, `subscriber on a invalid once handler, got ${handler}`);

    if (!this[__once].hasOwnProperty(event)) {
      this[__once][event] = {};
    }

    let handlers = this[__once][event];
    this.__assert.isTrue(!this.__lodash.has(handlers, target._uid), `subscriber on a handler that exist,got ${target._uid}`);

    handlers[target._uid] = {h: handler, t: target};
    this[__once][event] = handlers;

    return this;
  }

  /**
   * 解除注册
   * @param event
   * @param target
   * @param handler
   * @returns {EventBus}
   */
  off (event, target, handler) {
    this.__assert.isStringNotEmpty(event, `subscriber off a invalid event, got ${event}`);
    this.__assert.isFunction(handler, `subscriber off a invalid handler, got ${handler}`);

    // subscribers
    __offSubscribeEvent.call(this, event, target, handler);

    // once
    __offOnceEvent.call(this, event, target, handler);

    return this;
  }

  /**
   * 抛出事件
   * @param event
   * @param args
   * @returns {EventBus}
   */
  emit (event, ...args) {
    this.__assert.isStringNotEmpty(event, `event bus emit a invalid event, got ${event}`);

    // subscriber
    __fireSubscribeEvent.call(this, event, ...args);

    // once
    __fireOnceEvent.call(this, event, ...args);

    return this;
  }

  /**
   * 是否注册了事件
   * @param event
   * @param target
   */
  hasEvent (event, target) {
    let handlers = this[__subscribers][event];
    return this.__lodash.has(handlers, target._uid);
  }
}
