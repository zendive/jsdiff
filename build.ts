import { build, type BuildOptions, context, stop } from 'esbuild';
import manifest from './manifest.json' with { type: 'json' };
import vue3Plugin from 'esbuild-plugin-vue3';

const isProd = Deno.env.get('BUILD_MODE') === 'production';
// @note: in Firefox, loading local extension requires selecting a zip file
// which is built by `make all` command, hense checking for `isProd`
// to emphasise that
const isFirefox = isProd && Deno.args.includes('--x-is-firefox');
const buildMode = isProd ? 'production' : 'development';
const logLevel = isProd ? 'warning' : 'debug';
const buildVersion = generateBuildVersion(isProd, manifest);
const buildOptions: BuildOptions = {
  plugins: [
    vue3Plugin(),
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
    __app_version__: `"${buildVersion}"`,
    __app_homepage__: `"${manifest.homepage_url}"`,
    __firefox__: `${isFirefox}`,
  },
  loader: {
    '.png': 'file',
    '.svg': 'file',
  },
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: 'esnext',
  conditions: [buildMode],
  minify: isProd,
  sourcemap: false,
  treeShaking: true,
  logLevel,
};

if (isProd) {
  await build(buildOptions);
  await stop();
} else {
  const ctx = await context(buildOptions);
  await ctx.watch();
}

/**
 * Get or regenerate build number and update current manifest copy
 * Assuming current manifest is a writable copy of a relevant extension manifest
 * * in production build - just return authored version
 * * in development build - keep incrementing each build 4th
 */
function generateBuildVersion(isProd: boolean, manifest: { version: string }) {
  if (isProd) return manifest.version;

  // major minor patch revision
  const aMaMiPaBu = manifest.version.split('.');

  if (!aMaMiPaBu[3]) {
    aMaMiPaBu[3] = '0';
  } else {
    // The integers must be between 0 and 65535, inclusive
    const CAP = 65536;
    const buildNum = (Number.parseInt(aMaMiPaBu[3], 10) + 1) % CAP;
    aMaMiPaBu[3] = String(buildNum);
  }

  manifest.version = aMaMiPaBu.join('.');

  Deno.writeTextFile('./manifest.json', JSON.stringify(manifest, null, 2))
    .catch(console.error);

  return manifest.version;
}
