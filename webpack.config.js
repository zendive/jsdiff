const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = function (env, op) {
  const isProd = op.mode === 'production';

  return {
    mode: op.mode,

    entry: {
      'jsdiff-panel': './src/js/jsdiff-panel.js',
    },

    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'src/js/bundle'),
    },

    resolve: {
      modules: [path.resolve(__dirname, 'src/js'), 'node_modules'],

      alias: {},
    },

    plugins: [
      new CleanWebpackPlugin(),
      new VueLoaderPlugin(),
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        logLevel: 'silent',
      }),
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
      }),
    ],

    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.(scss|css)$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
      ],
    },

    optimization: {
      splitChunks: false,
    },

    devtool: isProd ? false : 'source-map',
  };
};
