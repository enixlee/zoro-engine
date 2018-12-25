// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'debug') ? 2 : 0,
    // 禁止比较时使用NaN，只能用isNaN()
    "use-isnan": 2,
    // 语句强制分号结尾
    "semi": [2, "always"]
  }
}