function getElementText(_ref: HTMLElement | null): string {
  return _ref ? _ref.textContent || _ref.innerText : '';
}

function eachByQuery(
  el: HTMLElement,
  query: string,
  fn: (_ref: HTMLElement) => void
) {
  const elems = el.querySelectorAll(query) as NodeListOf<HTMLElement>;
  for (let i = 0, l = elems.length; i < l; i++) {
    fn(elems[i]);
  }
}

function eachChildren(
  _ref2: ParentNode | null,
  fn: (el: HTMLElement, i: number) => void
) {
  if (_ref2) {
    const children = _ref2.children;

    for (let i = 0, l = children.length; i < l; i++) {
      fn(children[i] as HTMLElement, i);
    }
  }
}

export const postDiffRender = () => {
  setTimeout(function jsondiffpatchHtmlFormatterAdjustArrows(
    nodeArg: HTMLElement
  ) {
    const node = nodeArg || document;

    eachByQuery(node, '.jsondiffpatch-arrow', function (_ref3) {
      const parentNode = _ref3.parentNode;
      const children = _ref3.children;
      const style = _ref3.style;
      const arrowParent = parentNode;
      const svg = children[0] as HTMLElement;
      const path = svg.children[1];

      svg.style.display = 'none';

      if (arrowParent instanceof HTMLElement) {
        const destination = getElementText(
          arrowParent.querySelector('.jsondiffpatch-moved-destination')
        );
        const container = arrowParent.parentNode;
        let destinationElem: unknown;

        eachChildren(container, function (child) {
          if (child.getAttribute('data-key') === destination) {
            destinationElem = child;
          }
        });

        if (destinationElem instanceof HTMLElement) {
          try {
            const distance = destinationElem.offsetTop - arrowParent.offsetTop;
            svg.setAttribute('height', `${Math.abs(distance) + 6}`);
            style.top = -8 + (distance > 0 ? 0 : distance) + 'px';
            const curve =
              distance > 0
                ? 'M30,0 Q-10,' +
                  Math.round(distance / 2) +
                  ' 26,' +
                  (distance - 4)
                : 'M30,' +
                  -distance +
                  ' Q-10,' +
                  Math.round(-distance / 2) +
                  ' 26,4';
            path.setAttribute('d', curve);
            svg.style.display = '';
          } catch (ignore) {}
        }
      }
    });
  },
  10);
};
