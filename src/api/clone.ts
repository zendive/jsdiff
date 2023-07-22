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

class Catalog {
  #instances: WeakMap<object, string>;
  #instanceCounter = 0;
  #symbols: Map<object, string>;
  #symbolCounter = 0;

  constructor() {
    this.#instances = new WeakMap();
    this.#symbols = new Map();
  }

  clear() {
    this.#symbols.clear();
  }

  #counterToString(counter: number): string {
    return counter.toString(16).padStart(4, '0');
  }

  getRecurringName(value: object, instanceBadge: (id: string) => string) {
    let instanceId = this.#instances.get(value);

    if (instanceId) {
      return instanceBadge(instanceId);
    } else {
      ++this.#instanceCounter;
      instanceId = this.#counterToString(this.#instanceCounter);
      this.#instances.set(value, instanceId);

      return null;
    }
  }

  getSymbolName(
    value: Symbol,
    symbolBage: (symbolName: string, symbolId: string) => string
  ): string {
    let symbolId = this.#symbols.get(value);

    if (!symbolId) {
      ++this.#symbolCounter;
      symbolId = this.#counterToString(this.#symbolCounter);
      this.#symbols.set(value, symbolId);
    }

    return symbolBage(value.toString(), symbolId);
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

  if (isNonSerializable(value)) {
    rv = undefined;
  } else if (isFunction(value)) {
    return await serializeFunction(value);
  } else if (isSymbol(value)) {
    rv = catalog.getSymbolName(value, TAG.IS_SYMBOL);
  } else if (isArray(value)) {
    const recurringName = catalog.getRecurringName(
      value,
      TAG.VALUE_IS_REOCCURING_ARRAY
    );

    if (recurringName) {
      rv = recurringName;
    } else {
      const arr = [];
      for (const v of value) {
        arr.push(await recursiveClone(catalog, v));
      }
      rv = arr;
    }
  }
  // TODO: Map, Set
  else if (isObject(value)) {
    const recurringName = catalog.getRecurringName(
      value,
      TAG.VALUE_IS_REOCCURING_OBJECT
    );

    if (recurringName) {
      rv = recurringName;
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
          let newKey;
          let newValue;

          if (isSymbol(key)) {
            newKey = catalog.getSymbolName(key, TAG.IS_SYMBOL);
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
  }

  return rv;
}

async function serializeFunction(value: IHasToString): Promise<string> {
  const fnBody = value.toString();

  if (fnBody.endsWith('{ [native code] }')) {
    return TAG.VALUE_IS_NATIVE_FUNCTION;
  } else {
    const hash = await SHA256(fnBody);
    return TAG.VALUE_IS_FUCNTION(hash);
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
    ? TAG.VALUE_HAD_EXCEPTION(error.toString())
    : TAG.EXCEPTION;
}

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

function isNonSerializable(that: unknown): boolean {
  return (
    that instanceof Element || that instanceof Document //||that instanceof Promise
  );
}

function isSymbol(that: unknown): that is Symbol {
  return typeof that === 'symbol';
}

function isObject(that: unknown): that is object {
  return that instanceof Object || (that !== null && typeof that === 'object');
}
