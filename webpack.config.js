module.exports = {
  entry: './src/client/main.js',
  output: {
    path: './lib/daemon/public',
    filename: 'build.js'
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
