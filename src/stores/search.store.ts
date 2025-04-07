import { UPPERCASE_PATTERN } from '../api/const.ts';
import { defineStore } from 'pinia';
import { markRaw } from 'vue';

interface ISearchStoreState {
  deltaEl: HTMLElement | null;
  foundEls: HTMLElement[];
  userQuery: string;
  searchQuery: string;
  currentIndex: number;
}

export const useSearchStore = defineStore('searchStore', {
  state: (): ISearchStoreState => ({
    deltaEl: null,
    foundEls: [],
    userQuery: '', // current user query
    searchQuery: '', // invoked search query
    currentIndex: -1,
  }),

  getters: {
    outOfSync(): boolean {
      return this.userQuery !== this.searchQuery;
    },
  },

  actions: {
    clear() {
      this.foundEls.splice(0);
      this.userQuery = '';
      this.searchQuery = '';
      this.currentIndex = -1;
    },

    assignDeltaElement(el: HTMLElement | null) {
      this.deltaEl =
        el && typeof el === 'object' ? markRaw<HTMLElement>(el) : null;
      this.clear();
    },

    searchCancel() {
      clearHighlight(this.foundEls);
      this.clear();
    },

    _ensureFreshResults() {
      if (this.outOfSync) {
        clearHighlight(this.foundEls);
        this.foundEls.splice(0);
        this.searchQuery = this.userQuery;

        if (this.searchQuery) {
          highlightAll(
            this.deltaEl,
            this.searchQuery,
            UPPERCASE_PATTERN.test(this.searchQuery),
            /*IN/OUT*/ this.foundEls
          );
          this.currentIndex = -1;
        }
      }
    },

    searchNext(step: -1 | 1, prefferFresh = true) {
      prefferFresh && this._ensureFreshResults();

      if (this.foundEls.length) {
        clearCurrent(this.foundEls[this.currentIndex]);

        this.currentIndex += step;
        this.currentIndex = indexInBound(
          this.currentIndex,
          this.foundEls.length
        );

        highlightCurrent(this.foundEls[this.currentIndex]);
      }
    },
  },
});

const CLASS_FOUND = 'jsdiff-found';
const CLASS_FOUND_THIS = 'jsdiff-found-this';

function indexInBound(index: number, arrayLength: number): number {
  if (index < 0) {
    return arrayLength - 1;
  } else {
    return index % arrayLength;
  }
}

function clearHighlight(els: HTMLElement[]): void {
  for (let n = els.length - 1; n >= 0; n--) {
    els[n].classList.remove(CLASS_FOUND, CLASS_FOUND_THIS);
  }
}

function clearCurrent(el: HTMLElement) {
  el?.classList.remove(CLASS_FOUND_THIS);
}

function highlightCurrent(el: HTMLElement) {
  el?.classList.add(CLASS_FOUND_THIS);
  el?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'nearest',
  });
}

/**
 * Find nodes containing string query recursively
 * @param container
 * @param query
 * @param els
 * @returns
 */
function highlightAll(
  container: HTMLElement | null,
  query: string,
  isCaseSensitive: boolean,
  /*IN/OUT*/ els: HTMLElement[]
) {
  if (!container) {
    return;
  }

  const containerNodes = <NodeListOf<HTMLElement>>container.childNodes;

  if (!containerNodes.length) {
    return;
  }

  const firstChild = containerNodes[0];
  const isLeafNode =
    containerNodes.length === 1 && firstChild.nodeType === Node.TEXT_NODE;

  if (isLeafNode) {
    const text = firstChild.textContent || firstChild.innerText;
    const hasMatch = isCaseSensitive
      ? text.includes(query)
      : text.toLocaleLowerCase().includes(query);

    if (!hasMatch) {
      return;
    }

    const isHidden =
      container.closest('.jsondiffpatch-unchanged-hidden') &&
      container.closest('.jsondiffpatch-unchanged');

    if (isHidden) {
      return;
    }

    container.classList.add('jsdiff-found');
    els.push(markRaw(container));
  } else {
    for (let n = 0, N = containerNodes.length; n < N; n++) {
      const child = containerNodes[n];

      if (child.nodeType === Node.ELEMENT_NODE) {
        highlightAll(child, query, isCaseSensitive, els); // recursion
      }
    }
  }
}
