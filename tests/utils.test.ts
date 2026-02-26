import { describe, test } from '@std/testing/bdd';
import { expect } from '@std/expect';
import { stripDeepObjectPrototype } from '../src/api/clone.ts';

describe('stripDeepObjectPrototype', () => {
  test('prototype trimmed', () => {
    const obj = {
      obj: {},
      arr: [{
        obj: {},
      }],
    };
    const trimmed = stripDeepObjectPrototype(obj);

    expect(trimmed).toEqual(obj);
    expect(trimmed).not.toBeInstanceOf(Object);
    expect(trimmed.obj).not.toBeInstanceOf(Object);
    expect(trimmed.arr[0]).not.toBeInstanceOf(Object);
    expect(trimmed.arr[0].obj).not.toBeInstanceOf(Object);
  });
});
