const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  mode: 'development',

  entry: {
    'jsdiff-panel': './src/js/jsdiff-panel.js',
    demo: './src/demo/index.js'
  },

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },

  resolve: {
    modules: [
      path.resolve(__dirname, 'src/js'),
      'node_modules'
    ],

    alias: {}
  },

  plugins: [
    new CleanWebpackPlugin(['dist']),
    new VueLoaderPlugin()
  ],

  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },

  optimization : {
    runtimeChunk : false,
  },

  devtool: 'source-map'
};