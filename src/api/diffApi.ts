import { hasValue } from './toolkit.ts';
import { type ISerializableObject } from './clone.ts';
import { create, type Delta } from 'jsondiffpatch/with-text-diffs';
import { format as formatHtml } from 'jsondiffpatch/formatters/html';
import { format as formatRFC6902 } from 'jsondiffpatch/formatters/jsonpatch';
export type { Delta } from 'jsondiffpatch';

const OBJECT_ID_IN_ARRAY = ['id', '_id', 'uuid', 'guid', 'ulid'];

const patcher = create({
  // used to match objects when diffing arrays, by default only === operator is used
  objectHash(item: object, index?: number) {
    const obj = <ISerializableObject> item;
    let rv: unknown = index;

    for (const prop of OBJECT_ID_IN_ARRAY) {
      if (hasValue(obj[prop])) {
        rv = obj[prop];
        break;
      }
    }

    return hasValue(rv) ? String(rv) : undefined;
  },

  arrays: {
    // default true, detect items moved inside the array (otherwise they will be registered as remove+add)
    detectMove: false,
  },

  textDiff: {
    minLength: 120, // default 60
  },
});

export function diff(left: unknown, right: unknown) {
  return patcher.diff(left, right);
}

export function formatDeltaAsRFC6902(delta: Delta) {
  try {
    return formatRFC6902(delta);
  } catch (e) {
    return String(e);
  }
}

export function buildDeltaElement(
  delta: Delta,
  left: unknown,
  hide: boolean,
) {
  let rv: Element | null = null;

  try {
    const html = formatHtml(delta, left);
    if (!html) {
      return null;
    }

    rv = createElement(html);

    hideUnchanged(hide, rv);
  } catch (e) {
    console.error('buildDeltaElement', e);
  }

  return rv;
}

// @ts-expect-error: 2026-03-31 - `Sanitizer` new in Chrome v146
const deltaHtmlSanitizer = new Sanitizer({
  comments: false,
  dataAttributes: false,
  // whitelist following attributes and elements:
  attributes: [{ name: 'class' }],
  elements: ['div', 'span', 'pre', 'ul', 'li'],
});

function createElement(html: string) {
  const virtualEl = document.createElement('div');
  // @ts-expect-error: 2026-03-31 - `setHTML` new in Chrome v146
  virtualEl.setHTML(html, { sanitizer: deltaHtmlSanitizer });

  return virtualEl.firstElementChild;
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
