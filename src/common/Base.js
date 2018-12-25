/**
 * Auth: lijiang
 * Date: 2018/2/28
 * Description: Base
 */
const __balaId = Symbol('balaId');
const __anchor = Symbol('__anchor');

function eventsOn () {
  this.getEngine().$lodash.map(this.subjects(), (listener, k) => {
    if (!this.getEngine().$bus.hasEvent(k, this)) {
      this.getEngine().$bus.on(k, this, listener);
    }
  });
}

// function eventsOff () {
//   this.getEngine().$lodash.map(this.subjects(), (listener, k) => {
//     this.getEngine().$bus.off(k, this, listener);
//   });
// }

export class Base {
  constructor () {
    let Vue = window.getVue();
    let engine = Vue.prototype.getEngine();
    this.__assert = engine.$assert;
    this.__lodash = engine.$lodash;
    this[__balaId] = null;
    if (engine.$idGenerator) {
      this[__balaId] = engine.$idGenerator.generateId('BalaObject');
    }

    this.pluginInit();
    if (engine.printf && engine.isDebug) {
      // engine.printf(`init bala object ${this.originName()}`);
    }
    eventsOn.call(this);
  }

  get $isBalaObject () {
    return true;
  }

  registerProtocol (Protocol) {
    this.__lodash.map(Protocol, (func, funcName) => {
      this.getEngine().$utils.defineProperty(
        this,
        funcName,
        func,
        false
      );
    });
    return this;
  }

  setAnchor (anchor) {
    this[__anchor] = anchor;
    return this;
  }

  getAnchor () {
    return this[__anchor];
  }

  subjects () {
    return {};
  }

  pluginInit () {
  }

  install () {
    // install sth
    this.__assert.isTrue(false, `install need todo sth`);
  }

  getEngine () {
    let Vue = window.getVue();
    return Vue.prototype.getEngine();
  }

  get name () {
    if (this[__balaId]) {
      return this.originName() + '@' + this[__balaId];
    } else {
      return this.originName();
    }
  }

  get _uid () {
    return this.name;
  }

  originName () {
    this.__assert.isTrue(false, `need implements this method`);
  }

  get uuid () {
    return this[__balaId];
  }
}
