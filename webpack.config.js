const webpack = require('webpack')
const simpleVars = require('postcss-simple-vars')

module.exports = {
  entry: './src/client/main.js',
  output: {
    path: './src/daemon/public',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css', 'postcss']
      },
      {
        test: /\.(eot|svg|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
        loader: 'url'
      }
    ]
  },
  plugins: [
    // window.fetch polyfill
    // See https://gist.github.com/Couto/b29676dd1ab8714a818f
    new webpack.ProvidePlugin({
      'Promise': 'exports?global.Promise!es6-promise',
      'fetch': 'exports?self.fetch!whatwg-fetch'
    })
  ],
  postcss: function () {
    return [simpleVars]
  }
}
