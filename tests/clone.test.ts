import { test } from 'node:test';
import assert from 'node:assert';
import { customClone } from '../src/api/clone.ts';

const symbol = {
  named1: Symbol('א'),
  named2: Symbol('named'),
  unnamed: Symbol(),
  global: Symbol.for('global'),
};

// mock DOM in node environment
Object.assign(globalThis, {
  Element: class Element {
    nodeName = 'stub-element';
  },
  Document: class Document {
    nodeName = 'stub-document';
  },
});

test('clone DOM', () => {
  assert.deepEqual(
    customClone({
      el: new Element(),
      doc: new Document(),
    }),
    {
      el: '{0001} DOM⟪stub-element⟫',
      doc: '{0002} DOM⟪stub-document⟫',
    }
  );
});

test('clone functions', () => {
  assert.deepEqual(
    customClone({
      fn0: function Fn0() {},
      fn1: function () {},
      fn2: () => {},
    }),
    {
      fn0: 'ƒ Fn0⟪8a5f41bbb08de4034edbb5a85e3f08635659641049ad882791c00b571368ed7b⟫',
      fn1: 'ƒ fn1⟪5ef5d1ac865d5989c69073dafa4c847fa199f1777c72dfb16a5d61104b6bc6f3⟫',
      fn2: 'ƒ fn2⟪dec7a076dec41531da7f2d40bd4b896e27d45dd09ecd541190941bf88e6de894⟫',
    }
  );

  assert.deepEqual(
    customClone(
      new Map([
        [function Fn0() {}, 0],
        [function () {}, 1],
        [() => {}, 2],
      ])
    ),
    {
      'ƒ Fn0⟪8a5f41bbb08de4034edbb5a85e3f08635659641049ad882791c00b571368ed7b⟫': 0,
      'ƒ⟪5ef5d1ac865d5989c69073dafa4c847fa199f1777c72dfb16a5d61104b6bc6f3⟫': 1,
      'ƒ⟪dec7a076dec41531da7f2d40bd4b896e27d45dd09ecd541190941bf88e6de894⟫': 2,
    }
  );
});

test('clone symbols', () => {
  assert.deepEqual(
    customClone({
      s0: symbol.unnamed,
      s1: symbol.named2,
      [symbol.named1]: 1,
      s2: symbol.global,
    }),
    {
      s0: '{0001} Symbol()',
      s1: '{0002} Symbol(named)',
      '{0003} Symbol(א)': 1,
      s2: 'Symbol(global)',
    }
  );
});

test('clone array alike', () => {
  const arrays = [
    new Array(0, 1),
    new Uint8Array([0, 1]),
    new Int8Array([0, 1]),
    new Uint8ClampedArray([0, 1]),
    new Uint16Array([0, 1]),
    new Int16Array([0, 1]),
    new Uint32Array([0, 1]),
    new Int32Array([0, 1]),
    new Float32Array([0, 1]),
    new BigUint64Array([0n, 1n]),
    new BigInt64Array([0n, 1n]),
    new Float64Array([0, 1]),
  ];

  for (const array of arrays) {
    if (typeof array[0] === 'bigint') {
      assert.deepEqual(customClone(array), ['BigInt⟪0⟫', 'BigInt⟪1⟫']);
    } else {
      assert.deepEqual(customClone(array), [0, 1]);
    }
  }
});

test('clone set', () => {
  assert.deepEqual(
    customClone({
      set: new Set<any>([0, 1]),
    }),
    {
      set: [0, 1],
    }
  );
});

test('clone map', () => {
  assert.deepEqual(
    customClone({
      map: new Map<any, any>([
        [0, 1],
        ['key1', 1],
        ['key2', new URL('x:</script>')],
        [new URL('x:</script>'), 1],
        [{}, 1],
        [undefined, 1],
        [symbol.named1, 1],
        [symbol.global, 1],
      ]),
    }),
    {
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
    }
  );
});

test('clone object', () => {
  const obj = { k: 1 };
  const arr = [1];
  const map = new Map([[0, 1]]);
  const set = new Set([1]);

  assert.deepEqual(
    customClone({
      originals: { arr, map, obj, set },
      copies: { arr, map, obj, set },
    }),
    {
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
    }
  );
});

test('clone special numerics', () => {
  assert.deepEqual(
    customClone({
      bigint: 0n,
      nan: NaN,
      negativeInf: -Infinity,
      positiveInf: Infinity,
    }),
    {
      bigint: 'BigInt⟪0⟫',
      nan: 'Number⟪NaN⟫',
      negativeInf: 'Number⟪-Infinity⟫',
      positiveInf: 'Number⟪Infinity⟫',
    }
  );
});

test('clone undefined', () => {
  assert.deepEqual(customClone(undefined), '⟪undefined⟫');
});

test('clone RegExp', () => {
  assert.deepEqual(
    customClone({
      test1: new RegExp('test1', 'gim'),
      test2: /test2/gim,
      map: new Map<any, any>([[/test3/gim, 'map-key-value']]),
    }),
    {
      test1: 'RegExp⟪/test1/gim⟫',
      test2: 'RegExp⟪/test2/gim⟫',
      map: { 'RegExp⟪/test3/gim⟫': 'map-key-value' },
    }
  );
});
