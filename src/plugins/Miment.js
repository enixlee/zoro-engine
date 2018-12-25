/**
 * Auth: lijiang
 * Date: 2018/4/20
 * Description: Miment
 */
Object.setPrototypeOf = Object.setPrototypeOf ||
  function (obj, proto) {
    obj.__proto__ = proto;
    return obj;
  };

/**
 * 用了点技巧的继承，实际上返回的是Date对象
 */
function Miment () {
  // 兼容苹果系统 不识别 2018-01-01 的问题
  if (typeof arguments[0] === 'string') arguments[0] = arguments[0].replace(/-/g, '/');
  // bind属于Function.prototype，接收的参数是：object, param1, params2...
  let dateInst = new (Function.prototype.bind.apply(Date, [Date].concat(Array.prototype.slice.call(arguments))))();
  // 更改原型指向，否则无法调用Miment原型上的方法
  // ES6方案中，这里就是[[prototype]]这个隐式原型对象，在没有标准以前就是__proto__
  Object.setPrototypeOf(dateInst, Miment.prototype);
  // 原型重新指回Date，否则根本无法算是继承
  Object.setPrototypeOf(Miment.prototype, Date.prototype);
  return dateInst;
}

Miment.prototype.format = format;
Miment.prototype.stamp = stamp;
Miment.prototype.json = json;

Miment.prototype.daysInMonth = daysInMonth;

Miment.prototype.add = add;
Miment.prototype.distance = distance;

Miment.prototype.firstDay = firstDay;
Miment.prototype.lastDay = lastDay;
Miment.prototype.firstDayOfWeek = firstDayOfWeek;

// 转换成星期的数组
const weekArray = ['日', '一', '二', '三', '四', '五', '六'];

// 格式化时间
function format (fmt, distance) {
  let year, month, day, hour, minute, second, weekDay, milliSecond;
  if (fmt === null || fmt === undefined) fmt = 'YYYY-MM-DD hh:mm:ss';
  if (distance) {
    let dtBegin, dtEnd;
    if (this.__distance_begin__ >= this.__distance_end__) {
      dtBegin = Miment(this.__distance_begin__);
      dtEnd = Miment(this.__distance_end__);
    } else {
      dtBegin = Miment(this.__distance_end__);
      dtEnd = Miment(this.__distance_begin__);
      // op = '-'
    }
    // 时间差的格式化
    year = dtBegin.getFullYear() - dtEnd.getFullYear();
    month = String(dtBegin.getMonth() - dtEnd.getMonth());
    day = String(dtBegin.getDate() - dtEnd.getDate());
    hour = String(dtBegin.getHours() - dtEnd.getHours());
    minute = String(dtBegin.getMinutes() - dtEnd.getMinutes());
    second = String(dtBegin.getSeconds() - dtEnd.getSeconds());
    weekDay = dtBegin.getDay() - dtEnd.getDay();
    milliSecond = dtBegin.getMilliseconds() - dtEnd.getMilliseconds();
  } else {
    // 普通的格式化
    year = this.getFullYear();
    month = String(this.getMonth() + 1);
    day = String(this.getDate());
    hour = String(this.getHours());
    minute = String(this.getMinutes());
    second = String(this.getSeconds());
    weekDay = this.getDay();
    milliSecond = this.getMilliseconds();
  }
  // 替换并且返回 格式化后的值
  fmt = fmt
    .replace('YYYY', year)
    .replace('MM', month[1] ? month : `0${month}`)
    .replace('DD', day[1] ? day : `0${day}`)
    .replace('hh', hour[1] ? hour : `0${hour}`)
    .replace('mm', minute[1] ? minute : `0${minute}`)
    .replace('ss', second[1] ? second : `0${second}`)
    .replace('SSS', milliSecond)
    .replace('ww', weekDay);
  fmt = distance ? fmt.replace('WW', weekDay) : fmt.replace('WW', weekArray[weekDay]);
  // return op + fmt
  return fmt;
}

// 把时间转换成JSON对象
function json () {
  let year = this.getFullYear();
  let month = this.getMonth() + 1;
  let date = this.getDate();

  let hour = this.getHours();
  let minute = this.getMinutes();
  let second = this.getSeconds();
  let day = this.getDay();
  let milliSecond = this.getMilliseconds();
  return {
    year: year,
    month: month,
    date: date,
    hour: hour,
    minute: minute,
    second: second,
    day: day,
    milliSecond: milliSecond
  };
}

// 转换为时间戳
function stamp () {
  return this.valueOf();
}

// 获取当前月的天数
function daysInMonth () {
  let year = this.getFullYear();
  let month = this.getMonth() + 1;
  let date = Miment(year, month, 0);
  return date.getDate();
}

// 增加(或减少)时间
function add (amount, unit) {
  if (!amount) amount = 0;
  switch (unit) {
    case 'YY':
    case 'YYYY':
      this.setFullYear(this.getFullYear() + amount);
      break;
    case 'MM':
      this.setMonth(this.getMonth() + amount);
      break;
    case 'DD':
      this.setDate(this.getDate() + amount);
      break;
    case 'hh':
      this.setHours(this.getHours() + amount);
      break;
    case 'mm':
      this.setMinutes(this.getMinutes() + amount);
      break;
    case 'ss':
      this.setSeconds(this.getSeconds() + amount);
      break;
    case 'SSS':
      this.setMilliseconds(this.getMilliseconds() + amount);
      break;
    case 'ww':
    case 'WW':
      this.setDate(this.getDate() + amount * 7);
      break;
  }
  return this;
}

// 计算2个时间的差距
function distance (dt, dt2) {
  let dtBegin, dtEnd;
  if (dt2) {
    dtBegin = Miment(dt).valueOf();
    dtEnd = Miment(dt2).valueOf();
  } else {
    dtBegin = this.valueOf();
    dtEnd = Miment(dt).valueOf();
  }
  let m = Miment(dtBegin - dtEnd);
  m.__distance_begin__ = dtBegin;
  m.__distance_end__ = dtEnd;
  return m;
}

// 获取每个月的第一天
function firstDay () {
  let year = this.getFullYear();
  let month = this.getMonth();
  return Miment(year, month, 1);
}

// 获取每个月的最后一天
function lastDay () {
  let year = this.getFullYear();
  let month = this.getMonth() + 1;
  return Miment(year, month, 0);
}

// 获取 本周的第一天（周日）
function firstDayOfWeek () {
  this.setDate(this.getDate() - this.getDay());
  return this;
}

export default Miment;
