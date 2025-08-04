const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'Image Styler',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({}),
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  devServer: {
    static: './dist',
    hot: true,
    open: true,
    port: 3001,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      "process": require.resolve("process/browser"),
      "buffer": require.resolve("buffer"),
      "util": require.resolve("util"),
    },
  },
};