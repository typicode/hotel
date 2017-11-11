const path = require('path')

module.exports = {
  target: 'web',
  entry: ['babel-polyfill', 'whatwg-fetch', './src/front/index.jsx'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
}
