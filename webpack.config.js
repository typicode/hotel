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
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.vue$/, // a regex for matching all files that end in `.vue`
        loader: 'vue'   // loader to use for matched files
      }
    ]
  },
  // https://github.com/vuejs/vue/wiki/Vue-2.0-RC-Starter-Resources#standalone-vs-runtime-builds
  resolve: {
    alias: {vue: 'vue/dist/vue.js'}
  }
}
