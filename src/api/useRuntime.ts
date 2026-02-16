/**
 * Browser extension runtime connection unified abstraction between chrome and firefox.
 * Chrome connection is straightforward, while firefox MV3 still communicates via
 * background script port that have limited live-span and should be kept alive
 * while still in use.
 *
 * @example
 * const runtime = useRuntime(); // once per component setup
 * runtime.connect((e) => { console.log(e); }); // once or multiple times per component
 * onUnmount(() => { runtime.disconnect(); });
 */

import {
  BACKGROUND_SCRIPT_CONNECTION_INTERVAL,
  BACKGROUND_SCRIPT_CONNECTION_NAME,
} from './const.ts';
import type { TRuntimeMessageOptions } from './proxy.ts';

type TRuntimeListener = (e: TRuntimeMessageOptions) => void;
type TRuntimeListenerAsync = (e: TRuntimeMessageOptions) => Promise<void>;

const allListeners = new Set<TRuntimeListener | TRuntimeListenerAsync>();

function callAllListeners(e: TRuntimeMessageOptions) {
  for (const listener of allListeners) {
    Promise.try(listener, e).catch((err) =>
      void console.error('RuntimeListener', err)
    );
  }
}

function getFirefoxPort(callback: TRuntimeListener) {
  const port = browser.runtime.connect({
    name: BACKGROUND_SCRIPT_CONNECTION_NAME,
  });

  // @ts-expect-error: expects callback with argument of type `object`
  // and not `any` as in chrome api
  port.onMessage.addListener(callback);

  return port;
}

if (typeof browser !== 'undefined') {
  // firefox
  let port = getFirefoxPort(callAllListeners);

  setInterval(() => {
    port.disconnect();
    port = getFirefoxPort(callAllListeners);
  }, BACKGROUND_SCRIPT_CONNECTION_INTERVAL);
} else {
  // chrome
  chrome.runtime.onMessage.addListener(callAllListeners);
}

export function useRuntime() {
  const localListeners = new Set<TRuntimeListenerAsync>();

  return {
    connect(listener: TRuntimeListenerAsync) {
      localListeners.add(listener);
      allListeners.add(listener);
    },

    disconnect() {
      for (const listener of localListeners) {
        allListeners.delete(listener);
      }
      localListeners.clear();
    },
  };
}
