import type { IConsoleApi } from '../api/console.ts';
import { CUSTOM_DOC_EVENT, type TContentScriptEvents } from '../api/events.ts';

export {};

declare global {
  const __development__: boolean;
  const __app_version__: string;
  const __app_homepage__: string;

  // firefox extension context
  // currently not present in '@types/firefox-webext-browser'
  var wrappedJSObject: { jsdiff: IConsoleApi };
  function cloneInto(...args: unknown[]): unknown;

  // custom event for document.dispatchEvent
  interface DocumentEventMap {
    [CUSTOM_DOC_EVENT]: CustomEvent<TContentScriptEvents>;
  }
}
