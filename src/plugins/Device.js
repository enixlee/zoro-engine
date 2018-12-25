/**
 * Auth: lijiang
 * Date: 2018/6/2
 * Description: Device
 */
import {Base} from '../common/Base';

export class Device extends Base {
  install () {
    this.getEngine().registerPlugin('$device', this);
  }

  originName () {
    return 'framework.Device';
  }

  versions () {
    let u = navigator.userAgent;
    // let app = navigator.appVersion;
    return {
      trident: u.indexOf('Trident') > -1,
      presto: u.indexOf('Presto') > -1,
      webKit: u.indexOf('AppleWebKit') > -1,
      gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') === -1,
      mobile: !!u.match(/AppleWebKit.*Mobile.*/),
      ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
      android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
      iPhone: u.indexOf('iPhone') > -1,
      iPad: u.indexOf('iPad') > -1,
      webApp: u.indexOf('Safari') === -1,
      weixin: u.indexOf('MicroMessenger') > -1,
      mac: u.indexOf('Mac OS X') > 0,
      qq: u.match(/\sQQ/i) === 'qq'
    };
  }

  language () {
    return (navigator.browserLanguage || navigator.language).toLowerCase();
  }
}
