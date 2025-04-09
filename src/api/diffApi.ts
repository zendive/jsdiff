import { hasValue } from './toolkit.ts';
import DiffMatchPatch from 'diff-match-patch';
import { create } from 'jsondiffpatch';
export type { Delta } from 'jsondiffpatch';

const patcher = create({
  // used to match objects when diffing arrays, by default only === operator is used
  objectHash(obj, index) {
    // this function is used only to when objects are not equal by ref
    const rv = hasValue(obj)
      ? 'id' in obj && hasValue(obj.id)
        ? obj.id
        : '_id' in obj && hasValue(obj._id)
        ? obj._id
        : index
      : index;

    return hasValue(rv) ? String(rv) : undefined;
  },

  arrays: {
    // default true, detect items moved inside the array (otherwise they will be registered as remove+add)
    detectMove: false,
    // default false, the value of items moved is not included in deltas
    includeValueOnMove: true,
  },

  textDiff: {
    diffMatchPatch: DiffMatchPatch,
    // default 60, minimum string length (left and right sides) to use text diff algorythm: google-diff-match-patch
    minLength: 120,
  },
});

export function diff(left: unknown, right: unknown) {
  return patcher.diff(left, right);
}
