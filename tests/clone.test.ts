import { describe, test } from '@std/testing/bdd';
import { expect } from '@std/expect';
import { customClone } from '../src/api/clone.ts';

const symbol = {
  named1: Symbol('א'),
  named2: Symbol('named'),
  unnamed: Symbol(),
  global: Symbol.for('global'),
};

// mock DOM in deno environment
Object.assign(globalThis, {
  Element: class Element {
    nodeName = 'stub-element';
  },
  Document: class Document {
    nodeName = 'stub-document';
  },
});

describe('clone', () => {
  test('DOM', () => {
    expect(customClone({
      el: new Element(),
      doc: new Document(),
    })).toEqual({
      el: '{0001} DOM⟪stub-element⟫',
      doc: '{0002} DOM⟪stub-document⟫',
    });
  });

  test('functions', () => {
    expect(customClone({
      fn0: function Fn0() {},
      fn1: function () {},
      fn2: () => {},
    })).toEqual({
      fn0:
        'ƒ Fn0⟪25c47080e8ab6915f19101be1916bf217f14c0105404f7d4492e98264dd9f41f⟫',
      fn1:
        'ƒ fn1⟪2c5b6eb83e48f2c44e8fe089c71fc049c3b02e4d0fb4ff84903436b4fcdd0d94⟫',
      fn2:
        'ƒ fn2⟪dec7a076dec41531da7f2d40bd4b896e27d45dd09ecd541190941bf88e6de894⟫',
    });

    expect(customClone(
      new Map([
        [function Fn0() {}, 0],
        [function () {}, 1],
        [() => {}, 2],
      ]),
    )).toEqual({
      'ƒ Fn0⟪25c47080e8ab6915f19101be1916bf217f14c0105404f7d4492e98264dd9f41f⟫':
        0,
      'ƒ⟪2c5b6eb83e48f2c44e8fe089c71fc049c3b02e4d0fb4ff84903436b4fcdd0d94⟫': 1,
      'ƒ⟪dec7a076dec41531da7f2d40bd4b896e27d45dd09ecd541190941bf88e6de894⟫': 2,
    });
  });

  test('symbols', () => {
    expect(customClone({
      s0: symbol.unnamed,
      s1: symbol.named2,
      [symbol.named1]: 1,
      s2: symbol.global,
    })).toEqual({
      s0: '{0001} Symbol()',
      s1: '{0002} Symbol(named)',
      '{0003} Symbol(א)': 1,
      s2: 'Symbol(global)',
    });
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
        expect(customClone(array)).toEqual(['BigInt⟪0⟫', 'BigInt⟪1⟫']);
      } else {
        expect(customClone(array)).toEqual([0, 1]);
      }
    }
  });

  test('set', () => {
    expect(
      customClone({
        set: new Set([0, 1]),
      }),
    ).toEqual({
      set: [0, 1],
    });
  });

  test('map', () => {
    expect(customClone({
      map: new Map<unknown, unknown>([
        [0, 1],
        ['key1', 1],
        ['key2', new URL('x:</script>')],
        [new URL('x:</script>'), 1],
        [{}, 1],
        [undefined, 1],
        [symbol.named1, 1],
        [symbol.global, 1],
      ]),
    })).toEqual({
      map: {
        '0': 1,
        key1: 1,
        key2: 'URL⟪x:</script>⟫',
        'URL⟪x:</script>⟫': 1,
        '[0003] Object⟪♻️⟫': 1,
        '⟪undefined⟫': 1,
        '{0003} Symbol(א)': 1,
        'Symbol(global)': 1,
      },
    });
  });

  test('object', () => {
    const obj = { k: 1 };
    const arr = [1];
    const map = new Map([[0, 1]]);
    const set = new Set([1]);

    expect(customClone({
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
        arr: '[0003] Array⟪♻️⟫',
        map: '[0004] Map⟪♻️⟫',
        obj: '[0005] Object⟪♻️⟫',
        set: '[0006] Set⟪♻️⟫',
      },
    });
  });

  test('special numerics', () => {
    expect(customClone({
      bigint: 0n,
      nan: NaN,
      negativeInf: -Infinity,
      positiveInf: Infinity,
    })).toEqual({
      bigint: 'BigInt⟪0⟫',
      nan: 'Number⟪NaN⟫',
      negativeInf: 'Number⟪-Infinity⟫',
      positiveInf: 'Number⟪Infinity⟫',
    });
  });

  test('undefined', () => {
    expect(customClone(undefined)).toEqual('⟪undefined⟫');
  });

  test('RegExp', () => {
    expect(customClone({
      test1: new RegExp('test1', 'gim'),
      test2: /test2/gim,
      map: new Map([[/test3/gim, 'map-key-value']]),
    })).toEqual({
      test1: 'RegExp⟪/test1/gim⟫',
      test2: 'RegExp⟪/test2/gim⟫',
      map: { 'RegExp⟪/test3/gim⟫': 'map-key-value' },
    });
  });
});
