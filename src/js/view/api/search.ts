type TSearchCommands = 'performSearch' | 'nextSearchResult' | 'cancelSearch';

export interface ISearchOptions {
  cmd: TSearchCommands;
  query: string | null;
}

interface ISearchState {
  foundEls: HTMLElement[];
  query: string;
  currentIndex: number;
  clear: () => void;
}

const searchState: ISearchState = {
  foundEls: [],
  query: '',
  currentIndex: -1,
  clear() {
    this.foundEls.splice(0);
    this.query = '';
    this.currentIndex = -1;
  },
};

const CLASS_FOUND = 'jsdiff-found';
const CLASS_FOUND_THIS = 'jsdiff-found-this';
const uppercasePattern = /\p{Lu}/u; // 'u' flag enables Unicode matching

function hasUppercaseCharacter(str: string): boolean {
  for (let n = 0, N = str.length; n < N; n++) {
    if (uppercasePattern.test(str.charAt(n))) {
      return true;
    }
  }

  return false;
}

function highlightElements(
  container: HTMLElement,
  query: string,
  foundEls: HTMLElement[]
): void {
  const containerNodes = container.childNodes as NodeListOf<HTMLElement>;

  if (containerNodes.length) {
    const firstChild = containerNodes[0];

    if (containerNodes.length === 1 && firstChild.nodeType === Node.TEXT_NODE) {
      const text = firstChild.textContent || firstChild.innerText;
      const found = hasUppercaseCharacter(query)
        ? text.includes(query) // case-sensitive
        : text.toLocaleLowerCase().includes(query); // case-insensitive
      const isHidden =
        container.closest('.jsondiffpatch-unchanged-hidden') &&
        container.closest('.jsondiffpatch-unchanged');

      if (found && !isHidden) {
        container.classList.add('jsdiff-found');
        foundEls.push(container);
      }
    } else {
      for (let n = 0, N = containerNodes.length; n < N; n++) {
        const child = containerNodes[n];

        if (child.nodeType === Node.ELEMENT_NODE) {
          highlightElements(child, query, foundEls); // recursion
        }
      }
    }
  }
}

function clearHighlight(container: HTMLElement): void {
  const allFound = container.querySelectorAll(`.${CLASS_FOUND}`);

  for (let n = allFound.length - 1; n >= 0; n--) {
    allFound[n].classList.remove(CLASS_FOUND, CLASS_FOUND_THIS);
  }
}

function highlightCurrentResult(searchState: ISearchState): void {
  searchState.currentIndex++;
  searchState.currentIndex %= searchState.foundEls.length;

  const el = searchState.foundEls[searchState.currentIndex];
  el.classList.add(CLASS_FOUND_THIS);
  el.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'nearest',
  });
}

export function searchQueryInDom(
  el: HTMLElement,
  { cmd, query }: ISearchOptions
): void {
  query = (typeof query === 'string' && query.trim()) || '';

  // console.log('🔦', cmd, query);

  if ('performSearch' === cmd) {
    searchState.query = query;

    if (!query) {
      searchState.clear();
      clearHighlight(el);
    }
  } else if ('nextSearchResult' === cmd && searchState.query) {
    clearHighlight(el);
    searchState.foundEls.splice(0);
    highlightElements(el, searchState.query, searchState.foundEls);

    if (searchState.foundEls.length) {
      highlightCurrentResult(searchState);
    } else {
      searchState.clear();
      clearHighlight(el);
    }
  } else if ('cancelSearch' === cmd) {
    searchState.clear();
    clearHighlight(el);
  }
}
