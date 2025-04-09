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

type TRuntimeListener = (...args: unknown[]) => void;

const allListeners = new Set<TRuntimeListener>();

function callAllListeners(...args: unknown[]) {
  for (const listener of allListeners) {
    listener(...args);
  }
}

function getFirefoxPort(callback: TRuntimeListener) {
  const port = browser.runtime.connect({
    name: BACKGROUND_SCRIPT_CONNECTION_NAME,
  });

  port.onMessage.addListener(callback);

  return port;
}

if (typeof browser !== 'undefined') {
  // firefox
  // deno-lint-ignore no-unused-vars
  let port = getFirefoxPort(callAllListeners);

  setInterval(() => {
    port = getFirefoxPort(callAllListeners);
  }, BACKGROUND_SCRIPT_CONNECTION_INTERVAL);
} else {
  // chrome
  chrome.runtime.onMessage.addListener(callAllListeners);
}

export function useRuntime() {
  const localListeners = new Set<TRuntimeListener>();

  return {
    connect(listener: TRuntimeListener) {
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
