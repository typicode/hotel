const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

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
      },
      {
        test: /(\.js|\.jsx)$/,
        loader: 'babel-loader',
        include: [
          path.resolve(
            __dirname,
            './node_modules/react-icons/md/arrow-downward'
          ),
          path.resolve(__dirname, './node_modules/react-icons/md/clear-all')
        ],
        query: {
          presets: ['es2015', 'react']
        }
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
    new HtmlWebpackPlugin({
      template: 'src/app/index.html'
    })
  ]
}
