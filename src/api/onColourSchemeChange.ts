export type TColourScheme = 'light' | 'dark';

/**
 * NOTE: if OS is dark but devtools is default - then scheme is dark
 */
export function onColourSchemeChange(
  callback: (scheme: TColourScheme) => void,
) {
  const devtoolsScheme = chrome.devtools.panels.themeName;
  const osDarkScheme = globalThis.matchMedia('(prefers-color-scheme: dark)');

  if (devtoolsScheme === 'dark' || osDarkScheme.matches) {
    callback('dark');
  } else {
    callback('light');
  }

  osDarkScheme.addEventListener('change', (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  });
}
