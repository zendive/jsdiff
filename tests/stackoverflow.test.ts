import { describe, test } from '@std/testing/bdd';
import { expect } from '@std/expect';
import './polyfill.ts';
import { clone } from '../src/api/clone.ts';
import { diff, formatDeltaAsRFC6902 } from '../src/api/diffApi.ts';
import { format as formatHtml } from 'jsondiffpatch/formatters/html';

// Generate array deep enough so an attemmpt to traverse it recurcively
// would fail with stack overflow exception.
//
// Nesting depth to trigger the effect depends on the environment:
// - deno: 4e3, chrome: 5e3 (2026-09)
// - for perspective: "out of memory" triggered with 6e6 in deno
//
// chrome.storage.local was able to save an array only 98 levels deep,
//   quietly truncating the rest of it
const DEPTH = 5e3;
function generateDeepArray(root: unknown[], seed: unknown) {
  let next = root;

  for (let n = 0; n < DEPTH; n++) {
    next.push([]);
    next = next[0] as unknown[];
  }

  next[0] = seed;

  return root;
}

describe('stackoverflow resilience', () => {
  const SOF_ERROR = 'RangeError: Maximum call stack size exceeded';

  Deno.writeTextFile(
    `./tmp/${DEPTH}.deepArray.json`,
    JSON.stringify(generateDeepArray([], DEPTH + 1)),
  );

  test('baseline - structuredClone throws', () => {
    const arr = generateDeepArray([], Math.PI);
    let exception = false;

    try {
      structuredClone(arr);
    } catch (err) {
      expect(String(err)).toBe(SOF_ERROR);
      exception = true;
    }
    expect(exception).toBe(true);
  });

  test('customClone', () => {
    const arr = generateDeepArray([], Math.PI);
    let exception = false;

    try {
      const result = clone(arr);
      expect(result).toBeInstanceOf(Array);
    } catch (err) {
      expect(String(err)).toBe(SOF_ERROR);
      exception = true;
    }

    expect(exception).toBe(false);
  });

  test('jsondiffpatch', () => {
    const left = generateDeepArray([], Math.PI);
    const right = generateDeepArray([], Math.E);
    let exception = false;

    try {
      const delta = diff(left, right);
      expect(delta).toBeInstanceOf(Object);

      // incomplete - contains only 851 <ul>'s
      const html = formatHtml(delta, left);
      Deno.writeTextFile(`./tmp/${DEPTH}.delta.html`, html!);
      expect(html!.includes('Maximum call stack size exceeded')).toBe(true);

      // OK
      const deltaRFC6902 = formatDeltaAsRFC6902(delta);
      Deno.writeTextFile(
        `./tmp/${DEPTH}.deltaRFC6902.json`,
        JSON.stringify(deltaRFC6902),
      );
    } catch (err) {
      expect(String(err)).toBe(SOF_ERROR);
      exception = true;
    }

    expect(exception).toBe(false);
  });
});
