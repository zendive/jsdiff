type TSearchCommands = 'performSearch' | 'nextSearchResult' | 'cancelSearch';
interface ISearchOptions {
  el: HTMLElement;
  cmd: TSearchCommands;
  query: string | null;
}
const searchState = {
  lastCmd: '',
  currentEl: 0,
};

function highlightElements(container: HTMLElement, query: string): void {
  const childNodes = container.childNodes;

  for (let n = 0, N = childNodes.length; n < N; n++) {
    const child = childNodes[n];
    if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as HTMLElement;
      const text = element.textContent || element.innerText;
      if (text.includes(query)) {
        element.classList.add('found');
      }
      highlightElements(element, query); // recursion
    }
  }
}

function clearHighlight(container: HTMLElement) {
  const allFound = container.querySelectorAll('.found');

  for (let n = 0, N = allFound.length; n < N; n++) {
    allFound[n].classList.remove('found', 'foundThis');
  }
}

export function searchQueryInDom({ el, cmd, query }: ISearchOptions) {
  query = (typeof query === 'string' && query.trim()) || '';
  console.log('🔦', cmd, query);

  if ('performSearch' === cmd && query) {
    highlightElements(el, query);
  } else if ('nextSearchResult' === cmd) {
    // TODO: ...
  } else if ('cancelSearch' === cmd) {
    clearHighlight(el);
  }
}
