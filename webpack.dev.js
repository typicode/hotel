const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const conf = require('./src/conf')

module.exports = merge(common, {
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    proxy: {
      '/_': `http://localhost:${conf.port}`
    }
  }
})
