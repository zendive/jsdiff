import diffApi from '@/api/diffApi.ts';
import type { Delta } from '@/api/diffApi.ts';
import { hasValue } from '@/api/toolkit.ts';
import { defineStore } from 'pinia';
import { markRaw } from 'vue';
import { useRuntime } from '@/api/useRuntime.ts';
import { useSearchStore } from '@/stores/search.store.ts';

function defaultCompareState(): ICompareState {
  return {
    timestamp: 0,
    left: undefined,
    right: undefined,
  };
}

export const useCompareStore = defineStore('compareStore', {
  state: () => ({
    initialized: false,
    inprogress: false,
    compare: defaultCompareState(),
    showOnlyChanged: false,
    lastError: '',
  }),

  getters: {
    hasBothSides(): boolean {
      return hasValue(this.compare.left) && hasValue(this.compare.right);
    },

    deltaObj(): Delta {
      return diffApi.diff(this.compare.left, this.compare.right);
    },
  },

  actions: {
    assign({ left, right, timestamp }: ICompareState) {
      this.compare = {
        left: left !== null && typeof left === 'object' ? markRaw(left) : left,
        right:
          right !== null && typeof right === 'object' ? markRaw(right) : right,
        timestamp: timestamp || Date.now(),
      };
    },

    clear() {
      chrome.storage.local.clear();
      this.compare = defaultCompareState();
      this.inprogress = false;
      this.lastError = '';
      this.showOnlyChanged = false;
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
        if (hasValue(lastApiReq)) {
          compareStore.assign(lastApiReq as ICompareState);
        }
        compareStore.lastError = lastError || '';
        compareStore.initialized = true;
      });

    runtime.connect(async (e: TRuntimeMessageOptions) => {
      if ('jsdiff-proxy-to-panel-error' === e.source) {
        const { lastError } = await chrome.storage.local.get(['lastError']);
        compareStore.lastError = lastError || '';
        compareStore.inprogress = false;
      } else if (
        'jsdiff-proxy-to-panel-inprogress' === e.source &&
        typeof e.on === 'boolean'
      ) {
        compareStore.inprogress = e.on;
      } else if ('jsdiff-proxy-to-panel-compare' === e.source) {
        compareStore.lastError = '';
        compareStore.inprogress = false;
        const { lastApiReq } = await chrome.storage.local.get(['lastApiReq']);

        if (hasValue(lastApiReq)) {
          compareStore.assign(lastApiReq as ICompareState);
          searchStore.searchCancel();
        }
      }
    });
  },
};
