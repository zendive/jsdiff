import { hasValue } from './toolkit.ts';
import { create } from 'jsondiffpatch/with-text-diffs';
import { ISerializableObject } from './clone.ts';
export type { Delta } from 'jsondiffpatch';

const OBJECT_ID_IN_ARRAY = ['id', '_id', 'uuid', 'name', 'key', 'version'];

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
