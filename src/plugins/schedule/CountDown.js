/**
 * Auth: lijiang
 * Date: 2018/3/27
 * Description: CountDown
 */
import {Base} from '../../common/Base';

export class CountDown extends Base {
  originName () {
    return 'engine.CountDown';
  }

  /**
   * @param engine
   * @param delay 毫秒
   * @param intervalCallback
   * @param endHandler
   * @param options {frame:毫秒}
   */
  constructor (engine, delay, intervalCallback, endHandler, options) {
    super(engine);
    if (!delay) throw new Error('No delay provided');

    if (typeof endHandler === 'object' && typeof options === 'undefined') {
      options = endHandler;
      endHandler = () => {
      };
    }

    this.handler = endHandler || function () {
    };

    this.options = options || {};

    if (typeof this.options.restart === 'undefined') this.options.restart = false;
    if (typeof this.options.frame === 'undefined') this.options.frame = 1000;

    this.delay = delay;
    this.countdown = delay;
    this.intervalCallback = intervalCallback;
  }

  remainTime () {
    return this.countdown;
  }

  pastedTime () {
    return this.delay - this.countdown;
  }

  reduceDelay () {
    this.countdown -= this.options.frame;

    if (this.countdown <= 0) this.options.restart ? this.restart() : this.stop();

    if (this.countdown > 0 && (typeof this.intervalCallback === 'function')) {
      this.intervalCallback(this.countdown, this.pastedTime());
    }
  }

  start () {
    setTimeout(this.handler.bind(this), this.countdown);
    setInterval(this.reduceDelay.bind(this), this.options.frame);
  }
};
