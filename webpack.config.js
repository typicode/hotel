module.exports = {
  entry: './src/client/main.js',
  output: {
    path: './src/daemon/public',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      }
    ]
  }
}
