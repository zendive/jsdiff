/**
 * Browser extension runtime connection unified abstraction between chrome and firefox.
 * Chrome connection is straightforward, while firefox MV3 still communicates via
 * background script port that have limited live-span and should be kept alive
 * while stil in use.
 *
 * @example
 * const runtime = useRuntime(); // once per component setup
 * runtime.connect((e) => { console.log(e); }); // once or multiple times per component
 * onUnmount(() => { runtime.disconnect(); });
 */

import {
  BACKGROUND_SCRIPT_CONNECTION_NAME,
  BACKGROUND_SCRIPT_CONNECTION_INTERVAL,
} from '@/api/const.ts';

type TRuntimeListener = (...args: any[]) => void;

const allListeners = new Set<TRuntimeListener>();

function callAllListeners(...args: any[]) {
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
  let port = getFirefoxPort(callAllListeners);

  setInterval(() => {
    port = getFirefoxPort(callAllListeners);
  }, BACKGROUND_SCRIPT_CONNECTION_INTERVAL);
} else {
  // chrome
  chrome.runtime.onMessage.addListener(callAllListeners);
}

export function useRuntime() {
  let localListeners = new Set<TRuntimeListener>();

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
