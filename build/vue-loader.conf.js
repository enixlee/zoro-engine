var utils = require('./utils')
var config = require('../config')
var isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'debug'

const path = require('path')
const museUiThemePath = path.join(
  __dirname,
  '..',
  'src',
  'assets',
  'muse_theme_custom.less'
);
var a = utils.cssLoaders({
  sourceMap: isProduction ?
    config.build.productionSourceMap : config.dev.cssSourceMap,
  extract: isProduction
});
a.less = [
  'vue-style-loader',
  'css-loader',
  {
    loader: 'less-loader',
    options: {
      globalVars: {
        museUiTheme: `'${museUiThemePath}'`
      }
    }
  }
];

module.exports = {
  loaders: a
};


// var utils = require('./utils')
// var config = require('../config')
// var isProduction = process.env.NODE_ENV === 'production'
//
// module.exports = {
//   loaders: utils.cssLoaders({
//     sourceMap: isProduction
//       ? config.build.productionSourceMap
//       : config.dev.cssSourceMap,
//     extract: isProduction
//   })
// }

