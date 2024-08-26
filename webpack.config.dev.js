// webpack.config.dev.js
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 載入 dotenv-webpack
const Dotenv = require('dotenv-webpack');

module.exports = {
	mode: 'development',
  devtool: 'eval-cheap-source-map',
  entry: [
    './src/js/index.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
      chunkFilename: "css/[id].css"
    }),
    new Dotenv({
      path: path.resolve(__dirname, '.env')
    }),
  ],
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader",]
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'] 
      },
      {
        test: /\.js$/,
        use: ['babel-loader']
      },
      {
        test: /\.md$/,
        use: ['html-loader', 'marked-loader']
      }
    ]
  },
  devServer: {
		static: {
      directory: path.join(__dirname, "./dist")
    },
    open: true,
    hot: true
  }
}