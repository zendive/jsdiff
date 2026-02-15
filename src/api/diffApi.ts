import { hasValue } from './toolkit.ts';
import { cleanObjectPrototype, type ISerializableObject } from './clone.ts';
import { create, type Delta } from 'jsondiffpatch/with-text-diffs';
import { format } from 'jsondiffpatch/formatters/html';
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
    // default false, the value of items moved is not included in deltas
    includeValueOnMove: true,
  },

  textDiff: {
    minLength: 120, // default 60
  },
});

export function diff(left: unknown, right: unknown) {
  return patcher.diff(left, right);
}

export function buildDeltaElement(
  delta: Delta,
  left: unknown,
  hide: boolean,
): Element | null {
  let html: string | undefined;

  try {
    html = format(
      cleanObjectPrototype(delta),
      cleanObjectPrototype(left),
    );
  } catch (e) {
    console.error('buildDeltaElement', e);
  }

  if (!html) {
    return null;
  }

  const tmpEl = document.createElement('div');
  tmpEl.innerHTML = html;
  const rv = tmpEl.firstElementChild;
  hideUnchanged(hide, rv);

  return rv;
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
