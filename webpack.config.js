const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
    }),
    new CleanWebpackPlugin(['src/js/bundle']),
    new VueLoaderPlugin(),
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
      logLevel: 'silent',
    }),
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
