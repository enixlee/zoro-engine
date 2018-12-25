require('./check-versions')()

process.env.NODE_ENV = 'production'

var ora = require('ora')
var rm = require('rimraf')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')
var config = require('../config')
var webpackConfig = require('./webpack.prod.conf')
// var client = require('scp2')

var spinner = ora('building for production...')
spinner.start()

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, function (err, stats) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    console.log(chalk.cyan('  Build complete.\n'))
    // client.scp('dist/', {
    //   host: '',
    //   username: '',
    //   password: '',
    //   path: '/www/site_agent_wx_merchant/dist'
    // }, function (err) {
    //   if (err) {
    //     console.log(chalk.yellow('  Upload package failed.\n'))
    //   } else {
    //     console.log(chalk.cyan('  Upload complete.\n'))
    //   }
    // })
  })
})
