const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/app/index.tsx',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'src/daemon/public/safari-pinned-tab.svg',
        to: 'safari-pinned-tab.svg'
      },
      {
        from: 'src/daemon/public/favicon.png',
        to: 'favicon.png'
      }
    ]),
    new HtmlWebpackPlugin({
      template: 'src/app/index.html'
    })
  ]
}
