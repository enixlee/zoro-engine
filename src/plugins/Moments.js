/**
 * Auth: lijiang
 * Date: 2018/3/27
 * Description: Moments
 */
import moment from 'moment';
import {Base} from '../common/Base';

export class Moments extends Base {
  originName () {
    return 'engine.Moments';
  }

  install () {
    this.getEngine().registerPlugin('$moments', this);
  }

  /**
   * 当前时间戳，秒
   * @return {number}
   */
  currentTime () {
    return this.moment().unix();
  }

  /**
   * moment实例
   * @returns {*|moment.Moment}
   */
  moment () {
    return moment(...arguments);
  }

  /**
   * 昨天
   * @returns {number}
   */
  yesterday () {
    return this.moment().add(-1, 'day').unix();
  }

  /**
   * 一天的开始
   * @param day 2017-10-10
   * @returns {string}
   */
  dayBegin (day) {
    return `${day} 00:00:00`;
  }

  /**
   * 一天的结束
   * @param day
   * @returns {string}
   */
  dayEnd (day) {
    return `${day} 23:59:59`;
  }

  /**
   * date YYYY-MM-DD hh:mm:ss 时间格式
   * @param date
   * @returns {number}
   */
  dateToTimeStamp (date) {
    return moment(date).unix();
  }

  /**
   * 格式化时间
   * @param milliseconds
   * @param format
   * @returns {string}
   */
  milliseconds2DateStr (milliseconds, format = 'YYYY-MM-DD HH:mm:ss') {
    return moment.unix(milliseconds).format(format);
  }
}
