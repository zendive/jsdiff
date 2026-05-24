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

import { BACKGROUND_SCRIPT_CONNECTION_NAME } from './const.ts';
import type { TRuntimeEvents } from './events.ts';

type TRuntimeListenerSync = (e: TRuntimeEvents) => void;
type TRuntimeListenerAsync = (e: TRuntimeEvents) => Promise<void>;
type TRuntimeListener = TRuntimeListenerSync | TRuntimeListenerAsync;

const allListeners = new Set<TRuntimeListener>();

function callAllListeners(e: TRuntimeEvents) {
  for (const listener of allListeners) {
    Promise.try(listener, e).catch((err) =>
      void console.error('RuntimeListener', err)
    );
  }
}

function connect2backgroundScript(callbacks: TRuntimeListener) {
  const port = <chrome.runtime.Port> browser.runtime.connect({
    name: BACKGROUND_SCRIPT_CONNECTION_NAME,
  });

  port.onDisconnect.addListener(() => {
    port.onMessage.removeListener(callbacks);
    connect2backgroundScript(callbacks);
  });
  port.onMessage.addListener(callbacks);
}

if (typeof browser !== 'undefined') {
  // firefox
  connect2backgroundScript(callAllListeners);
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
