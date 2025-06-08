import { build, type BuildOptions, context, stop } from 'esbuild';
import manifest from './manifest.json' with { type: 'json' };
import { vue3Plugin } from 'esbuild-plugin-vue-iii';

const nodeEnv = Deno.env.get('NODE_ENV');
const isProd = nodeEnv === 'production';
const buildOptions: BuildOptions = {
  plugins: [
    vue3Plugin({
      isProduction: isProd,
    }),
  ],
  entryPoints: [
    './src/jsdiff-devtools.ts',
    './src/jsdiff-panel.ts',
    './src/jsdiff-proxy.ts',
    './src/jsdiff-console.ts',
    './src/firefox/jsdiff-background.ts',
  ],
  outdir: './public/build/',
  publicPath: '/public/build/',
  define: {
    __VUE_OPTIONS_API__: 'false',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    __development__: `${!isProd}`,
    __app_version__: `"${manifest.version}"`,
    __app_homepage__: `"${manifest.homepage_url}"`,
  },
  loader: {
    '.png': 'file',
    '.svg': 'file',
  },
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: 'esnext',
  conditions: [`${nodeEnv}`],
  minify: isProd,
  sourcemap: false,
  treeShaking: true,
  logLevel: isProd ? 'warning' : 'debug',
};

if (isProd) {
  await build(buildOptions);
  await stop();
} else {
  const ctx = await context(buildOptions);
  await ctx.watch();
}
