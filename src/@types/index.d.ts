import { type TConsoleAPI } from '../jsdiff-console.ts';

export {};

declare global {
  const __development__: boolean;
  const __app_version__: string;
  const __app_homepage__: string;

  // firefox
  var wrappedJSObject: { jsdiff: TConsoleAPI };

  // firefox extension context
  // currently not present in '@types/firefox-webext-browser'
  function cloneInto(...args: unknown[]): unknown;
}
