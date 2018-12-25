/**
 * Auth: lijiang
 * Date: 2018/3/27
 * Description: Schedule
 */
import {Base} from '../../common/Base';
import {CountDown} from './CountDown';

const __worker = Symbol('__worker');
const __timer = Symbol('__timer');

const SCHEDULE_FOREVER_INTERVAL = 799999999999;
const SCHEDULE_FRAME = 100;

/**
 * 创建计时器
 * @private
 */
function __createTimer () {
  if (this[__timer] === null) {
    this[__timer] = new CountDown(
      this.getEngine(),
      SCHEDULE_FOREVER_INTERVAL,
      (leftTime, pastTime) => {
        __runFrame.call(this, leftTime, pastTime);
      }, () => {
        __kill.call(this);
      }, {
        frame: SCHEDULE_FRAME
      });
    this[__timer].start();
  }
}

/**
 * 帧动作
 * @param leftTime
 * @param pastTime
 * @private
 */
function __runFrame (leftTime, pastTime) {
  let onceWorkers = [];
  this.__lodash.map(this[__worker], (worker, k) => {
    let frame = worker.frame;
    let pt = worker.pastTime;
    if (pt === null) {
      worker.pastTime = pastTime;
      // 初始化不执行，需要等到第一次schedule执行，可能会慢100ms
      if (worker.doRightNow) {
        worker.do.call(worker.owner);
        if (worker.once) {
          onceWorkers.push(k);
        }
      }
    } else {
      let interval = pastTime - pt;
      if (interval % frame === 0) {
        worker.do.call(worker.owner);
        if (worker.once) {
          onceWorkers.push(k);
        }
      }
    }
  });

  onceWorkers.forEach((frameKey) => {
    this.unRegisterWorker(frameKey);
  });
}

function __unRegisterAll () {
  console.info('重置1');
  this[__worker] = {};
}

/**
 * 终止
 * @private
 */
function __kill () {
  __unRegisterAll.call(this);
}

export class Schedule extends Base {
  originName () {
    return 'engine.Schedule';
  }

  install () {
    this.getEngine().registerPlugin('$juggler', this);
  }

  pluginInit () {
    this[__worker] = {};
    this[__timer] = null;
  }

  /**
   * 不提供remove方法
   * @param frameKey
   * @param frameTime
   * @param owner
   * @param dealer
   * @param once
   * @param doRightNow
   */
  registerWorker (frameKey, frameTime, owner, dealer, once = false, doRightNow = false) {
    this.__assert.isString(frameKey, `schedule frame key invalid, got ${frameKey}`);
    this.__assert.isNumber(frameTime, `schedule worker register frame time is not number, got ${frameTime}`);
    this.__assert.isFunction(dealer, `schedule worker register dealer is not function, got ${dealer}`);
    this.__assert.isObject(owner, `schedule owner invalid, got ${owner}`);

    this[__worker][frameKey] = {
      frameKey: frameKey,
      frame: frameTime,
      do: dealer,
      once: once,
      owner: owner,
      pastTime: null,
      doRightNow: doRightNow
    };
    // 延时初始化
    if (this[__timer] === null) {
      __createTimer.call(this);
    }
  }

  unRegisterWorker (frameKey) {
    if (this[__worker][frameKey]) {
      delete this[__worker][frameKey];
      if (!this.__lodash.isObject(this[__worker])) {
        this[__worker] = {};
      }
    }
  }

  /**
   * 是否注册了
   * @param frameKey
   */
  hasWorker (frameKey) {
    return this.getEngine().$lodash.isObject(this[__worker][frameKey]);
  }
}
