import { hasValue } from './toolkit';
import DiffMatchPatch from 'diff-match-patch';
import * as jsondiffpatch from 'jsondiffpatch';
export type { Delta } from 'jsondiffpatch';
import type { Delta } from 'jsondiffpatch';
import { format, showUnchanged } from 'jsondiffpatch/formatters/html';

const patcher = jsondiffpatch.create({
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

export default {
  diff(left: unknown, right: unknown) {
    return patcher.diff(left, right);
  },

  format(delta: Delta, left: unknown) {
    return format(delta, left);
  },

  showUnchanged(show: boolean, el: HTMLElement) {
    showUnchanged(show, el);
  },
};
