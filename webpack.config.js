const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  mode: 'development',

  entry: {
    'jsdiff-panel': './src/js/jsdiff-panel.js'
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'src/js/bundle')
  },

  resolve: {
    modules: [
      path.resolve(__dirname, 'src/js'),
      'node_modules'
    ],

    alias: {}
  },

  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }),
    new CleanWebpackPlugin(['src/js/bundle']),
    new VueLoaderPlugin()
  ],

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(scss|css)$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },

  optimization : {
    runtimeChunk : false,
  },

  // devtool: 'source-map'
  devtool: false
};
