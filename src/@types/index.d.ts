export {};

declare global {
  const __development__: boolean;
  const __app_version__: string;
  const __app_homepage__: string;

  interface Window {
    wrappedJSObject: { jsdiff: () => void };
  }

  // firefox extension context
  // currently not present in '@types/firefox-webext-browser'
  function cloneInto(...args: unknown[]): unknown;
}
