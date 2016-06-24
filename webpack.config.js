module.exports = {
  target: 'web',
  entry: [
    'babel-polyfill',
    'whatwg-fetch',
    './src/front/index.js'
  ],
  output: {
    path: 'dist',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  }
}
