import { describe, test } from '@std/testing/bdd';
import { expect } from '@std/expect';
import './polyfill.ts';
import { clone } from '../src/api/clone.ts';

describe('clone', () => {
  const symbol = {
    named: Symbol('named'),
    unnamed: Symbol(),
    global: Symbol.for('global'),
  };

  test('primitives', () => {
    expect(clone(1)).toEqual(1);
    expect(clone('str')).toEqual('str');
    expect(clone(false)).toEqual(false);
    expect(clone(undefined)).toEqual('⟪undefined⟫');
    expect(clone(null)).toEqual(null);
    expect(clone(function name() {})).toEqual(
      'ƒ name⟪5174321a80c248445cccd2e0fbb90bb4371e146dd19ed0b4c1ec3dd63bd4b221⟫',
    );
    expect(clone(() => {})).toEqual(
      'ƒ⟪dec7a076dec41531da7f2d40bd4b896e27d45dd09ecd541190941bf88e6de894⟫',
    );
    expect(clone(symbol.named)).toEqual('{0001} Symbol(named)');
    expect(clone(symbol.unnamed)).toEqual('{0002} Symbol()');
    expect(clone(symbol.global)).toEqual('Symbol(global)');
    expect(clone(new RegExp('test1', 'gim'))).toEqual('RegExp⟪/test1/gim⟫');
    expect(clone(new URL('x:</script>'))).toEqual('URL⟪x:</script>⟫');
    expect(clone(1n)).toEqual('1n');
    expect(clone(NaN)).toEqual('Number⟪NaN⟫');
    expect(clone(-Infinity)).toEqual('Number⟪-Infinity⟫');
    expect(clone(Infinity)).toEqual('Number⟪Infinity⟫');
    expect(clone(new Element())).toEqual('{0001} DOM⟪stub-element⟫');
    expect(clone(new Document())).toEqual('{0002} DOM⟪stub-document⟫');
  });

  test('array alike', () => {
    const arrays = [
      new Array(...[0, 1]),
      new Uint8Array([0, 1]),
      new Uint8ClampedArray([0, 1]),
      new Uint16Array([0, 1]),
      new Uint32Array([0, 1]),
      new Int8Array([0, 1]),
      new Int16Array([0, 1]),
      new Int32Array([0, 1]),
      new Float16Array([0, 1]),
      new Float32Array([0, 1]),
      new Float64Array([0, 1]),
      new BigUint64Array([0n, 1n]),
      new BigInt64Array([0n, 1n]),
    ];

    for (const array of arrays) {
      if (typeof array[0] === 'bigint') {
        expect(clone(array)).toEqual(['0n', '1n']);
      } else {
        expect(clone(array)).toEqual([0, 1]);
      }
    }
  });

  test('set', () => {
    expect(
      clone({
        set: new Set([0, 1]),
      }),
    ).toEqual({
      set: [0, 1],
    });
  });

  test('map', () => {
    expect(clone({
      map: new Map<unknown, unknown>([
        [0, 1],
        [null, 1],
        [undefined, 1],
        [true, 1],
        ['key1', 1],
        [new URL('x:</script>'), 1],
        [/test/gim, 'map-key-value'],
        [{}, 1],
        [undefined, 1],
        [symbol.global, 1],
      ]),
    })).toEqual({
      map: {
        '0': 1,
        'null': 1,
        //undefined: 1,
        'true': 1,
        key1: 1,
        'URL⟪x:</script>⟫': 1,
        'RegExp⟪/test/gim⟫': 'map-key-value',
        '[0003] Object⟪♻️⟫': 1,
        '⟪undefined⟫': 1,
        'Symbol(global)': 1,
      },
    });
  });

  test('object', () => {
    const obj = { k: 1 };
    const arr = [1];
    const map = new Map([[0, 1]]);
    const set = new Set([1]);

    expect(clone({
      originals: { arr, map, obj, set },
      copies: { arr, map, obj, set },
    })).toEqual({
      originals: {
        arr: [1],
        map: { '0': 1 },
        obj: { k: 1 },
        set: [1],
      },
      copies: {
        arr: '[0004] Array⟪♻️⟫',
        map: '[0005] Map⟪♻️⟫',
        obj: '[0006] Object⟪♻️⟫',
        set: '[0007] Set⟪♻️⟫',
      },
    });
  });
});
