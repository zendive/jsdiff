import {
  buildDeltaElement,
  type Delta,
  diff,
  formatDeltaAsRFC6902,
} from '../api/diffApi.ts';
import { hasValue } from '../api/toolkit.ts';
import { stripDeepObjectPrototype } from '../api/clone.ts';
import { defineStore } from 'pinia';
import { useRuntime } from '../api/useRuntime.ts';
import { useSearchStore } from './search.store.ts';
import { ERT_TYPE } from '../api/events.ts';

interface ICompareState {
  timestamp: number;
  left?: unknown;
  right?: unknown;
}

let leftSide: unknown = undefined;
let deltaObj: Delta = undefined;

export const useCompareStore = defineStore('compareStore', {
  state: () => ({
    initialized: false,
    inprogress: false,
    timestamp: 0,
    hasDelta: false,
    lastError: '',
    showOnlyChanged: JSON.parse(
      localStorage.getItem('showOnlyChanged') || 'false',
    ),
  }),

  actions: {
    compare(left: unknown, right: unknown, timestamp: number) {
      leftSide = stripDeepObjectPrototype(left);
      deltaObj = stripDeepObjectPrototype(
        diff(
          leftSide,
          stripDeepObjectPrototype(right),
        ),
      );

      this.hasDelta = deltaObj !== undefined;
      this.timestamp = timestamp;
    },

    async clear() {
      await chrome.storage.local.clear();
      this.timestamp = 0;
      this.hasDelta = false;
      this.inprogress = false;
      this.lastError = '';
      leftSide = undefined;
      deltaObj = undefined;
    },

    getDeltaElement() {
      return buildDeltaElement(
        leftSide,
        deltaObj,
        this.showOnlyChanged,
      );
    },

    getDeltaCopy(): string {
      if (!deltaObj) return '';

      const delta = formatDeltaAsRFC6902(deltaObj);
      return JSON.stringify(delta, null, 2);
    },
  },
});

/**
 * Listen to runtime, mutate store accordingly
 * @example
 * createApp(...)
 *  .use(compareStoreRuntimeService);
 */
export const compareStoreRuntimeService = {
  install(/*app, options*/) {
    const runtime = useRuntime();
    const compareStore = useCompareStore();
    const searchStore = useSearchStore();

    chrome.storage.local
      .get(['lastApiReq', 'lastError'])
      .then(({ lastApiReq, lastError }) => {
        if (!lastError && hasValue(lastApiReq)) {
          const { left, right, timestamp } = lastApiReq as ICompareState;
          compareStore.compare(left, right, timestamp);
        }

        compareStore.lastError = lastError ? String(lastError) : '';
        compareStore.initialized = true;
      });

    runtime.connect((e) => {
      if (ERT_TYPE.PROGRESS === e.type) {
        compareStore.inprogress = e.on;
      } else if (ERT_TYPE.ERROR === e.type) {
        compareStore.lastError = e.lastError;
        compareStore.inprogress = false;
      } else if (ERT_TYPE.DIFF === e.type) {
        compareStore.lastError = '';
        compareStore.inprogress = false;

        if (hasValue(e.payload)) {
          const { left, right, timestamp } = e.payload;
          compareStore.compare(left, right, timestamp);
          searchStore.searchCancel();
        }
      }
    });

    compareStore.$subscribe((_mut, state) => {
      localStorage.setItem('showOnlyChanged', String(state.showOnlyChanged));
    });
  },
};
