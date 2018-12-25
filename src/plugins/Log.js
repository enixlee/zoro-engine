/**
 * Auth: lijiang
 * Date: 2018/2/12
 * Description: Log
 */
import {Base} from '../common/Base';

export class Log extends Base {
  originName () {
    return 'engine.Log';
  }

  install () {
    this.getEngine().registerPlugin('$log', this);
    this.getEngine().registerPlugin('printf', this.printf);
    this.getEngine().registerPlugin('printStack', this.printStack);
  }

  printf () {
    let ins = this;
    if (ins.isLogger && ins.isLogger()) {
      ins = this.getEngine();
    } else {
      ins = this.$engine;
    }

    if (ins.isProduct) {
      return;
    }

    let args = Array.prototype.slice.call(arguments);
    args.unshift('color:#3ebcca');
    args.unshift(`%c[Bala]`);

    // let err = new Error();
    // let stack = err.stack.split('\n')[2].trim();
    // stack = `                       print ${stack}`;
    // args.push(stack);

    console.log.apply(console, args);
  }

  printStack () {
    let ins = this;
    if (ins.isLogger && ins.isLogger()) {
      ins = this.getEngine();
    } else {
      ins = this.$engine;
    }

    if (ins.isProduct) {
      return;
    }

    console.trace();
  }

  profileTimeStart (profileKey) {
    let ins = this;
    if (ins.isLogger && ins.isLogger()) {
      ins = this.getEngine();
    } else {
      ins = this.$engine;
    }

    if (ins.isProduct) {
      return;
    }

    ins.$assert.isString(profileKey, 'profile start need a key of string type');
    console.time(profileKey);
  }

  profileTimeEnd (profileKey) {
    let ins = this;
    if (ins.isLogger && ins.isLogger()) {
      ins = this.getEngine();
    } else {
      ins = this.$engine;
    }

    if (ins.isProduct) {
      return;
    }

    ins.$assert.isString(profileKey, 'profile end need a key of string type');
    console.timeEnd(profileKey);
  }

  isLogger () {
    return this.toString() === Log.LOGGER_NAME;
  }

  toString () {
    return this.originName();
  }
}
