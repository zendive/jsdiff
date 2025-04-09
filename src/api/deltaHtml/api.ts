import { type Delta, HtmlFormatter } from './HtmlFormatter.ts';

let htmlFormatter: HtmlFormatter;

export function buildDeltaElement(
  delta: Delta,
  left: unknown,
  hide: boolean,
): Element | null {
  if (!htmlFormatter) {
    htmlFormatter = new HtmlFormatter();
  }

  const html = htmlFormatter.format(delta, left);
  if (!html) {
    return null;
  }

  const tmpEl = document.createElement('div');
  tmpEl.innerHTML = html;
  const rv = tmpEl.firstElementChild;
  hideUnchanged(hide, rv);

  return rv!;
}

const unchangedHiddenClass = 'jsondiffpatch-unchanged-hidden';
export function hideUnchanged(hide: boolean, el: Element | null) {
  if (!el) {
    return;
  }

  if (hide) {
    el.classList.add(unchangedHiddenClass);
  } else {
    el.classList.remove(unchangedHiddenClass);
  }
}
