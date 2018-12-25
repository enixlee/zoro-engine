/**
 * Auth: lijiang
 * Date: 2018/2/25
 * Description: includes
 */
import {Base} from './common/Base';
import {Log} from './plugins/Log';
import {TypeCheck} from './plugins/TypeCheck';
import {Crypto} from './plugins/Crypto';
import {Storage} from './plugins/Storage';
import {EventBus} from './plugins/EventBus';
import {RpcManager} from './rpc/RpcManager';
// import {Router} from './router/router';
// import {Render} from './plugins/component/Render';
import {IDGenerator} from './plugins/IDGenerator';
import {Moments} from './plugins/Moments';
import {Schedule} from './plugins/schedule/Schedule';
import {KVStore} from './plugins/KVStore';
import {Device} from './plugins/Device';

// import {Uploader} from './rpc/Uploader';

export class Includes extends Base {
  originName () {
    return 'engine.Includes';
  }

  install () {
    this.getEngine().use(new IDGenerator());
    this.getEngine().use(new EventBus());
    this.getEngine().use(new Log());
    this.getEngine().use(new TypeCheck());
    this.getEngine().use(new Crypto());
    this.getEngine().use(new Storage());
    // this.getEngine().use(new Router());
    this.getEngine().use(new RpcManager());
    // this.getEngine().use(new Render());
    this.getEngine().use(new Moments());
    this.getEngine().use(new Schedule());
    this.getEngine().use(new KVStore());
    this.getEngine().use(new Device());
    // this.getEngine().use(new Uploader());
  }
}
