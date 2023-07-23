import { TAG } from '@/api/const';
import { SHA256 } from './toolkit';

export async function nativeClone(value: unknown): Promise<unknown> {
  let set: Set<unknown> | void = new Set();
  const rv = JSON.parse(
    JSON.stringify(value, nativeClonePostDataAdapter.bind(null, set))
  );

  set = set.clear();

  return rv;
}

type TInstanceBadgeTag = (id: string) => string;
type TSymbolBadgeTag = (symbolName: string, symbolId: string) => string;

class Catalog {
  #instances: Map<unknown, string>;
  #instanceCounter = 0;

  constructor() {
    this.#instances = new Map();
  }

  clear() {
    this.#instances.clear();
  }

  #counterToString(counter: number): string {
    return counter.toString(16).padStart(4, '0');
  }

  get(
    value: unknown,
    badge: TInstanceBadgeTag | TSymbolBadgeTag
  ): { seenBefore: boolean; name: string } {
    let instanceId = this.#instances.get(value);
    let seenBefore = true;

    if (!instanceId) {
      seenBefore = false;
      ++this.#instanceCounter;
      instanceId = this.#counterToString(this.#instanceCounter);
      this.#instances.set(value, instanceId);
    }

    return {
      seenBefore,
      name: isSymbol(value)
        ? (badge as TSymbolBadgeTag)(value.toString(), instanceId)
        : (badge as TInstanceBadgeTag)(instanceId),
    };
  }
}

export async function customClone(value: unknown): Promise<unknown> {
  let catalog: Catalog | null = new Catalog();
  const rv = await recursiveClone(catalog, value);

  catalog.clear();
  catalog = null;

  return rv;
}

async function recursiveClone(
  catalog: Catalog,
  value: unknown
): Promise<unknown> {
  let rv = value;

  if (isUnserializable(value)) {
    catalog.get(value, TAG.NON_SERIALIZABLE);
    rv = undefined;
  } else if (isFunction(value)) {
    return await serializeFunction(value);
  } else if (isSymbol(value)) {
    const { name } = catalog.get(value, TAG.SYMBOL);
    rv = name;
  } else if (isArray(value)) {
    const { seenBefore, name } = catalog.get(value, TAG.RECURRING_ARRAY);

    if (seenBefore) {
      rv = name;
    } else {
      const arr = [];

      for (const v of value) {
        arr.push(await recursiveClone(catalog, v));
      }

      rv = arr;
    }
  } else if (isSet(value)) {
    const { seenBefore, name } = catalog.get(value, TAG.RECURRING_SET);

    if (seenBefore) {
      rv = name;
    } else {
      const arr = [];

      for (const v of value) {
        arr.push(await recursiveClone(catalog, v));
      }

      rv = arr;
    }
  } else if (isMap(value)) {
    const { seenBefore, name } = catalog.get(value, TAG.RECURRING_MAP);

    if (seenBefore) {
      rv = name;
    } else {
      const obj = {} as ISerializeToObject;

      for (const [k, v] of value) {
        let newKey, newValue;

        if (isUnserializable(k)) {
          const { name } = catalog.get(k, TAG.NON_SERIALIZABLE);
          newKey = name;
        } else if (isFunction(k)) {
          newKey = await serializeFunction(k);
        } else if (isSymbol(k)) {
          const { name } = catalog.get(k, TAG.SYMBOL);
          newKey = name;
        } else if (isArray(k)) {
          const { name } = catalog.get(k, TAG.RECURRING_ARRAY);
          newKey = name;
        } else if (isSet(k)) {
          const { name } = catalog.get(k, TAG.RECURRING_SET);
          newKey = name;
        } else if (isMap(k)) {
          const { name } = catalog.get(k, TAG.RECURRING_MAP);
          newKey = name;
        } else if (isObject(k)) {
          const { name } = catalog.get(k, TAG.RECURRING_OBJECT);
          newKey = name;
        } else {
          newKey = String(k);
        }

        newValue = await recursiveClone(catalog, v);
        obj[newKey] = newValue;
      }

      rv = obj;
    }
  } else if (isObject(value)) {
    const { seenBefore, name } = catalog.get(value, TAG.RECURRING_OBJECT);

    if (seenBefore) {
      rv = name;
    } else {
      if (isSelfSerializableObject(value)) {
        rv = serializeSelfSerializable(value);

        if (typeof rv !== 'string') {
          rv = await recursiveClone(catalog, rv);
        }
      } else {
        const obj = {} as ISerializeToObject;
        const ownKeys = Reflect.ownKeys(value);

        for (const key of ownKeys) {
          let newKey, newValue;

          if (isSymbol(key)) {
            const { name } = catalog.get(key, TAG.SYMBOL);
            newKey = name;
          } else {
            newKey = key;
          }

          try {
            // accessing value by key may throw
            newValue = await recursiveClone(catalog, (value as any)[key]);
          } catch (error) {
            newValue = stringifyError(error);
          }

          obj[newKey] = newValue;
        }

        rv = obj;
      }
    }
  } else if (value === undefined) {
    rv = TAG.UNDEFINED;
  }

  return rv;
}
`  `;

async function serializeFunction(value: IHasToString): Promise<string> {
  const fnBody = value.toString();

  if (fnBody.endsWith('{ [native code] }')) {
    return TAG.NATIVE_FUNCTION;
  } else {
    const hash = await SHA256(fnBody);
    return TAG.FUCNTION(hash);
  }
}

interface ISerializeToObject {
  [key: string]: any;
}

function serializeSelfSerializable(value: IHasToJSON) {
  let rv = undefined;

  try {
    // rogue object may throw
    rv = value.toJSON();
  } catch (error) {
    rv = stringifyError(error);
  }

  return rv;
}

function stringifyError(error: unknown) {
  return typeof error?.toString === 'function'
    ? TAG.EXCEPTION(error.toString())
    : TAG.EXCEPTION_FALLBACK;
}

function nativeClonePostDataAdapter(
  set: Set<unknown>,
  key: string | Symbol,
  value: unknown
): unknown {
  try {
    if (isUnserializable(value)) {
      return undefined;
    } else if (isFunction(value)) {
      return value.toString();
    } else if (isObject(value)) {
      if (set.has(value)) {
        return undefined;
      } else {
        set.add(value);
      }
    }

    return value;
  } catch (error) {
    return stringifyError(error);
  }
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
    that instanceof BigInt64Array ||
    that instanceof Float32Array ||
    that instanceof Float64Array
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

function isSet(that: unknown): that is Set<unknown> {
  return that instanceof Set;
}

function isMap(that: unknown): that is Map<unknown, unknown> {
  return that instanceof Map;
}

function isSelfSerializableObject(that: unknown): that is IHasToJSON {
  let rv;

  try {
    rv =
      that !== null &&
      typeof that === 'object' &&
      'toJSON' in that &&
      typeof that.toJSON === 'function';
  } catch (ignore) {
    rv = false;
  }

  return rv;
}

function isUnserializable(that: unknown): boolean {
  return that instanceof Element || that instanceof Document;
}

function isSymbol(that: unknown): that is Symbol {
  return typeof that === 'symbol';
}

function isObject(that: unknown): that is object {
  return that instanceof Object || (that !== null && typeof that === 'object');
}
