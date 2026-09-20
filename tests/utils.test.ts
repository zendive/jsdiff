import { describe, test } from '@std/testing/bdd';
import { expect } from '@std/expect';
import { stripDeepObjectPrototype } from '../src/api/clone.ts';

describe('stripDeepObjectPrototype', () => {
  test('deep object', () => {
    const obj = {
      obj: { toString: 0 },
      arr: [{
        obj: { toValue: 0 },
      }],
    };
    const trimmed = stripDeepObjectPrototype(obj);

    expect(trimmed).toEqual(obj);
    expect(trimmed).not.toBeInstanceOf(Object);
    expect(trimmed.obj).not.toBeInstanceOf(Object);
    expect(trimmed.obj.toString).toBe(0);
    expect(trimmed.arr[0]).not.toBeInstanceOf(Object);
    expect(trimmed.arr[0].obj).not.toBeInstanceOf(Object);
    expect(trimmed.arr[0].obj.toValue).toBe(0);
  });

  test('deep array', () => {
    const arr = [
      { toString: 0 },
      [{
        obj: { arr: [{ toValue: 0 }] },
      }],
    ];
    const trimmed = stripDeepObjectPrototype(arr);

    expect(trimmed).toEqual(arr);
    expect(trimmed[0]).not.toBeInstanceOf(Object);
    expect(trimmed[0].toString).toBe(0);
    // @ts-expect-error: ignore
    expect(trimmed[1][0]).not.toBeInstanceOf(Object);
    // @ts-expect-error: ignore
    expect(trimmed[1][0].obj).not.toBeInstanceOf(Object);
    // @ts-expect-error: ignore
    expect(trimmed[1][0].obj.arr[0]).not.toBeInstanceOf(Object);
    // @ts-expect-error: ignore
    expect(trimmed[1][0].obj.arr[0].toValue).toBe(0);
  });

  test('primitives', () => {
    expect(stripDeepObjectPrototype(undefined)).toBe(undefined);
    expect(stripDeepObjectPrototype(null)).toBe(null);
    expect(stripDeepObjectPrototype(0n)).toBe(0n);
    expect(stripDeepObjectPrototype('echo')).toBe('echo');
  });
});
