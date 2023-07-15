import { TAG } from '@/api/const';

function nativeClonePostDataAdapter(
  set: Set<unknown>,
  key: string | Symbol,
  value: unknown
): unknown {
  try {
    if (isNonSerializable(value)) {
      return undefined;
    } else if (isFunction(value)) {
      return value.toString();
    } else if (value instanceof Object || typeof value === 'object') {
      if (set.has(value)) {
        return undefined;
      }
      set.add(value);
    }

    return value;
  } catch (ignore) {
    return undefined;
  }
}

export function nativeClone(value: unknown): unknown {
  let set: Set<unknown> | null = new Set();
  const rv = JSON.parse(
    JSON.stringify(value, nativeClonePostDataAdapter.bind(null, set))
  );

  set.clear();
  set = null;

  return rv;
}

function isArray(that: unknown): that is unknown[] {
  return (
    that instanceof Array ||
    that instanceof Uint8Array ||
    that instanceof Uint8ClampedArray ||
    that instanceof Uint16Array ||
    that instanceof Uint32Array ||
    that instanceof BigUint64Array ||
    that instanceof Int8Array ||
    that instanceof Int16Array ||
    that instanceof Int32Array ||
    that instanceof BigInt64Array
  );
}

interface IHasToString {
  toString: () => string;
}

interface IHasToJSON {
  toJSON: () => unknown;
}

function isFunction(that: unknown): that is IHasToString {
  return (
    typeof that === 'function' &&
    'toString' in that &&
    typeof that.toString === 'function'
  );
}

function isSelfSerializableObject(that: unknown): that is IHasToJSON {
  return (
    that !== null &&
    typeof that === 'object' &&
    'toJSON' in that &&
    typeof that.toJSON === 'function'
  );
}

function isNonSerializable(that: unknown): boolean {
  return that instanceof Element || that instanceof Document;
}

function isSymbol(that: unknown): that is Symbol {
  return typeof that === 'symbol';
}

function isObject(that: unknown): that is object {
  return that instanceof Object || typeof that === 'object';
}

function clone(weakSet: WeakSet<object>, value: unknown): unknown {
  let rv;

  if (isNonSerializable(value)) {
    rv = undefined;
  } else if (isArray(value)) {
    rv = [];
    for (const v of value) {
      rv.push(clone(weakSet, v)); // recursion
    }
  } else if (isSymbol(value)) {
    rv = value.toString();
  } else if (isObject(value)) {
    if (isSelfSerializableObject(value)) {
      try {
        // rogue object may throw
        rv = value.toJSON();
      } catch (error) {
        rv =
          typeof error?.toString === 'function'
            ? error.toString()
            : TAG.EXCEPTION;
      }
    } else {
      rv = {};
      const ownKeys = Reflect.ownKeys(value);

      // TODO: ...
    }
  }

  return rv;
}

export function customClone(value: unknown): unknown {
  let ws: WeakSet<object> | null = new WeakSet();
  const rv = clone(ws, value);
  ws = null;
  return rv;
}
