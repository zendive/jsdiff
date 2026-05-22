import { type Delta, diff } from '../api/diffApi.ts';
import { hasValue } from '../api/toolkit.ts';
import { stripDeepObjectPrototype } from '../api/clone.ts';
import { defineStore } from 'pinia';
import { markRaw } from 'vue';
import { useRuntime } from '../api/useRuntime.ts';
import { useSearchStore } from './search.store.ts';
import { ERT_TYPE } from '../api/events.ts';

interface ICompareState {
  timestamp: number;
  left?: unknown;
  right?: unknown;
}

function defaultCompareState(): ICompareState {
  return {
    timestamp: 0,
    left: undefined,
    right: undefined,
  };
}

function castrateObject<T>(that: T): T {
  if (that !== null && typeof that === 'object') {
    return markRaw(Object.freeze(stripDeepObjectPrototype(that)));
  }

  return that;
}

export const useCompareStore = defineStore('compareStore', {
  state: () => ({
    initialized: false,
    inprogress: false,
    compare: defaultCompareState(),
    showOnlyChanged: JSON.parse(
      localStorage.getItem('showOnlyChanged') || 'false',
    ),
    lastError: '',
  }),

  getters: {
    hasBothSides(): boolean {
      return hasValue(this.compare.left) && hasValue(this.compare.right);
    },

    deltaObj(): Delta {
      return castrateObject(diff(this.compare.left, this.compare.right));
    },
  },

  actions: {
    assign({ left, right, timestamp }: ICompareState) {
      this.compare = {
        left: castrateObject(left),
        right: castrateObject(right),
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
        compareStore.lastError = lastError ? String(lastError) : '';
        compareStore.initialized = true;
      });

    runtime.connect(async (e) => {
      if (ERT_TYPE.PROGRESS === e.type) {
        compareStore.inprogress = e.on;
      } else if (ERT_TYPE.ERROR === e.type) {
        const { lastError } = await chrome.storage.local.get(['lastError']);
        compareStore.lastError = lastError ? String(lastError) : '';
        compareStore.inprogress = false;
      } else if (ERT_TYPE.DIFF === e.type) {
        compareStore.lastError = '';
        compareStore.inprogress = false;

        if (hasValue(e.payload)) {
          compareStore.assign(e.payload);
          searchStore.searchCancel();
        }
      }
    });

    compareStore.$subscribe((_mut, state) => {
      localStorage.setItem('showOnlyChanged', String(state.showOnlyChanged));
    });
  },
};
