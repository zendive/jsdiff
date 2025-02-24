import { test } from 'node:test';
import assert from 'node:assert';
import { customClone } from '../src/api/clone.ts';

// mock DOM in node environment
Object.assign(globalThis, {
  Element: class Element {},
  Document: class Document {},
});

test('clone unserializable', async () => {
  assert.deepEqual(
    await customClone({
      el: new Element(),
      doc: new Document(),
    }),
    {
      el: '0x0002: ⟪unserializable⟫',
      doc: '0x0003: ⟪unserializable⟫',
    }
  );
});

test('clone functions', async () => {
  assert.deepEqual(
    await customClone({
      fn0: function Fn0() {},
      fn1: function () {},
      fn2: () => {},
    }),
    {
      fn0: 'ƒ Fn0⟪8A5F41BBB08DE4034EDBB5A85E3F08635659641049AD882791C00B571368ED7B⟫',
      fn1: 'ƒ fn1⟪5EF5D1AC865D5989C69073DAFA4C847FA199F1777C72DFB16A5D61104B6BC6F3⟫',
      fn2: 'ƒ fn2⟪DEC7A076DEC41531DA7F2D40BD4B896E27D45DD09ECD541190941BF88E6DE894⟫',
    }
  );

  assert.deepEqual(
    await customClone([function Fn0() {}, function () {}, () => {}]),
    [
      'ƒ Fn0⟪8A5F41BBB08DE4034EDBB5A85E3F08635659641049AD882791C00B571368ED7B⟫',
      'ƒ⟪5EF5D1AC865D5989C69073DAFA4C847FA199F1777C72DFB16A5D61104B6BC6F3⟫',
      'ƒ⟪DEC7A076DEC41531DA7F2D40BD4B896E27D45DD09ECD541190941BF88E6DE894⟫',
    ]
  );
});

test('clone symbols', async () => {
  assert.deepEqual(
    await customClone({
      s0: Symbol(),
      s1: Symbol('named'),
    }),
    {
      s0: '0x0002: Symbol()',
      s1: '0x0003: Symbol(named)',
    }
  );
});

test('clone array alike', async () => {
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
      assert.deepEqual(await customClone(array), ['BigInt⟪0⟫', 'BigInt⟪1⟫']);
    } else {
      assert.deepEqual(await customClone(array), [0, 1]);
    }
  }
});

test('clone set', async () => {
  assert.deepEqual(
    await customClone({
      set: new Set<any>([0, 1]),
    }),
    {
      set: [0, 1],
    }
  );
});

test('clone map', async () => {
  assert.deepEqual(
    await customClone({
      map: new Map<any, any>([
        [0, 1],
        ['key1', 1],
        [{}, 1],
        [undefined, 1],
      ]),
    }),
    {
      map: {
        '0': 1,
        key1: 1,
        '0x0003: {♻️}': 1,
        '⟪undefined⟫': 1,
      },
    }
  );
});

test('clone object', async () => {
  const obj0 = { obj: {} };

  assert.deepEqual(
    await customClone({
      obj0: obj0,
      obj1: {
        obj0: obj0,
      },
    }),
    {
      obj0: {
        obj: {},
      },
      obj1: {
        obj0: '0x0002: {♻️}',
      },
    }
  );
});

test('clone special numerics', async () => {
  assert.deepEqual(
    await customClone({
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

test('clone undefined', async () => {
  assert.deepEqual(await customClone(undefined), '⟪undefined⟫');
});

test('clone RegExp', async () => {
  assert.deepEqual(
    await customClone({
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
