import path from 'path';
import webpack from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { fileURLToPath } from 'url';
import { EsbuildPlugin } from 'esbuild-loader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function (
  env: string,
  op: { mode: webpack.Configuration['mode'] }
): webpack.Configuration {
  console.log('⌥', env, op.mode);
  const isProd = op.mode === 'production';

  return {
    mode: op.mode,

    entry: {
      'jsdiff-devtools': './src/jsdiff-devtools.ts',
      'jsdiff-panel': './src/view/app.js',
      'jsdiff-proxy': './src/jsdiff-proxy.ts',
      'jsdiff-console': './src/jsdiff-console.ts',
    },

    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'bundle/js'),
    },

    resolve: {
      extensions: ['.ts', '.js'],
      modules: [path.resolve(__dirname, 'src/js'), 'node_modules'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    plugins: [
      new CleanWebpackPlugin(),
      new VueLoaderPlugin(),
      isProd
        ? () => {}
        : new BundleAnalyzerPlugin({
            // http://127.0.0.1:8888
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
          test: /\.tsx?$/,
          loader: 'esbuild-loader',
          options: {
            loader: 'ts',
            target: 'es2022',
          },
        },
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
      minimize: isProd,
      minimizer: [new EsbuildPlugin()],
    },

    devtool: isProd ? false : 'source-map',
  };
}
