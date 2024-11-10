import webpack from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { EsbuildPlugin } from 'esbuild-loader';

export default function (
  env: string,
  op: { mode: webpack.Configuration['mode'] }
): webpack.Configuration {
  const isProd = op.mode === 'production';

  console.log('⌥', env, op.mode);
  if (!isProd) {
    console.log('Bundle anayser available at:', 'http://127.0.0.1:8888');
  }

  return {
    mode: op.mode,

    entry: {
      'jsdiff-devtools': './src/jsdiff-devtools.ts',
      'jsdiff-panel': './src/jsdiff-panel.js',
      'jsdiff-proxy': './src/jsdiff-proxy.ts',
      'jsdiff-console': './src/jsdiff-console.ts',
      'firefox/jsdiff-background': './src/firefox/background-script.ts',
    },

    output: {
      filename: '[name].js',
      path: new URL('bundle/js', import.meta.url).pathname,
    },

    resolve: {
      extensions: ['.ts', '.js'],
      modules: [new URL('src/js', import.meta.url).pathname, 'node_modules'],
      alias: {
        '@': new URL('src', import.meta.url).pathname,
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
        __VUE_OPTIONS_API__: 'false',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
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
        {
          test: /\.svg/,
          type: 'asset/resource',
        },
      ],
    },

    optimization: {
      splitChunks: false,
      minimize: isProd,
      minimizer: [
        new EsbuildPlugin({
          target: 'esnext',
        }),
      ],
    },

    devtool: isProd ? false : 'source-map',
  };
}
