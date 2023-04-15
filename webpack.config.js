import path from 'path';
import webpack from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function (env, op) {
  console.log('⌥', env, op.mode);
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
      extensions: ['.ts', '.js'],
      modules: [path.resolve(__dirname, 'src/js'), 'node_modules'],
      alias: {},
    },

    plugins: [
      new CleanWebpackPlugin(),
      new VueLoaderPlugin(),
      // http://127.0.0.1:8888
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
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: { appendTsSuffixTo: [/\.vue$/] },
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
}
