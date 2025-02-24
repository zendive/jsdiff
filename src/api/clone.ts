import { hashString } from '@/api/toolkit.ts';
import {
  TAG_EXCEPTION,
  TAG_EXCEPTION_FALLBACK,
  TAG_FUNCTION,
  TAG_NATIVE_FUNCTION,
  TAG_NULL,
  TAG_NUMERIC,
  TAG_RECURRING_ARRAY,
  TAG_RECURRING_MAP,
  TAG_RECURRING_OBJECT,
  TAG_RECURRING_SET,
  TAG_REGEXP,
  TAG_SYMBOL,
  TAG_UNDEFINED,
  TAG_DOM_ELEMENT,
} from '@/api/const.ts';

type TInstanceBadgeTag = (id: string) => string;
type TSymbolBadgeTag = (symbolName: string, symbolId: string) => string;
interface ICatalogRecord {
  name: string;
  seen: boolean;
}
interface ISerializeToObject {
  [key: string]: any;
}
interface IFunction {
  name: string;
  toString: () => string;
}
interface IHasToJSON {
  toJSON: () => unknown;
}

class LookupCatalog {
  #records: WeakMap<WeakKey, ICatalogRecord>;
  #instanceCounter = 0;

  constructor() {
    this.#records = new WeakMap();
  }

  #counterToString(counter: number): string {
    return counter.toString(16).padStart(4, '0');
  }

  lookup(
    key: WeakKey,
    badge: TInstanceBadgeTag | TSymbolBadgeTag
  ): ICatalogRecord {
    let record = this.#records.get(key);
    if (record) {
      return record;
    }

    const id = this.#counterToString(++this.#instanceCounter);
    record = {
      name: isSymbol(key)
        ? badge(key.toString(), id)
        : (badge as TInstanceBadgeTag)(id),
      seen: false,
    };
    this.#records.set(key, record);

    return record;
  }
}

export function post(payload: ICompareMessagePayload) {
  try {
    window.postMessage(
      { source: 'jsdiff-console-to-proxy-inprogress', on: true },
      '*'
    );

    for (const key of ['push', 'left', 'right']) {
      if (Reflect.has(payload, key)) {
        const value = payload[key];

        if (value === undefined) {
          payload[key] = TAG_UNDEFINED;
        } else if (value === null) {
          payload[key] = TAG_NULL;
        } else {
          payload[key] = customClone(value);
        }
      }
    }

    window.postMessage(
      { source: 'jsdiff-console-to-proxy-compare', payload },
      '*'
    );
  } catch (error) {
    console.error('console.diff()', error);

    window.postMessage(
      { source: 'jsdiff-console-to-proxy-inprogress', on: false },
      '*'
    );
  }
}

export function customClone(value: unknown) {
  let catalog: LookupCatalog | null = new LookupCatalog();
  const rv = recursiveClone(catalog, value);
  catalog = null;
  return rv;
}

function recursiveClone(catalog: LookupCatalog, value: unknown) {
  let rv = value;

  if (isDOM(value)) {
    const { name } = catalog.lookup(value, TAG_DOM_ELEMENT);
    rv = name;
  } else if (isFunction(value)) {
    rv = serializeFunction(value);
  } else if (isSymbol(value)) {
    const { name } = catalog.lookup(value, TAG_SYMBOL);
    rv = name;
  } else if (isRegExp(value)) {
    rv = TAG_REGEXP(value);
  } else if (isArray(value)) {
    rv = serializeArrayAlike(catalog, value, TAG_RECURRING_ARRAY);
  } else if (isSet(value)) {
    rv = serializeArrayAlike(catalog, value, TAG_RECURRING_SET);
  } else if (isMap(value)) {
    rv = serializeMap(catalog, value);
  } else if (isObject(value)) {
    rv = serializeObject(catalog, value);
  } else if (isNumericSpecials(value)) {
    rv = TAG_NUMERIC(value);
  } else if (value === undefined) {
    // JsonDiffPatch has a problem comparing with undefined value - storing a string instead
    rv = TAG_UNDEFINED;
  }

  return rv;
}

function serializeArrayAlike(
  catalog: LookupCatalog,
  value: unknown[] | Set<unknown>,
  badge: TInstanceBadgeTag
): unknown[] | string {
  const record = catalog.lookup(value, badge);
  let rv;

  if (record.seen) {
    rv = record.name;
  } else {
    record.seen = true;
    const arr = [];

    for (const v of value) {
      arr.push(recursiveClone(catalog, v));
    }

    rv = arr;
  }

  return rv;
}

function serializeMap(catalog: LookupCatalog, value: Map<unknown, unknown>) {
  const record = catalog.lookup(value, TAG_RECURRING_MAP);
  let rv;

  if (record.seen) {
    rv = record.name;
  } else {
    record.seen = true;
    const obj = {} as ISerializeToObject;

    for (const [k, v] of value) {
      const newKey = serializeMapKey(catalog, k);
      const newValue = recursiveClone(catalog, v);

      obj[newKey] = newValue;
    }

    rv = obj;
  }

  return rv;
}

function serializeMapKey(catalog: LookupCatalog, key: unknown): string {
  let rv;

  if (isDOM(key)) {
    const { name } = catalog.lookup(key, TAG_DOM_ELEMENT);
    rv = name;
  } else if (isFunction(key)) {
    rv = serializeFunction(key);
  } else if (isSymbol(key)) {
    const { name } = catalog.lookup(key, TAG_SYMBOL);
    rv = name;
  } else if (isRegExp(key)) {
    rv = TAG_REGEXP(key);
  } else if (isArray(key)) {
    const { name } = catalog.lookup(key, TAG_RECURRING_ARRAY);
    rv = name;
  } else if (isSet(key)) {
    const { name } = catalog.lookup(key, TAG_RECURRING_SET);
    rv = name;
  } else if (isMap(key)) {
    const { name } = catalog.lookup(key, TAG_RECURRING_MAP);
    rv = name;
  } else if (isObject(key)) {
    const { name } = catalog.lookup(key, TAG_RECURRING_OBJECT);
    rv = name;
  } else if (isNumericSpecials(key)) {
    rv = TAG_NUMERIC(key);
  } else if (key === undefined) {
    rv = TAG_UNDEFINED;
  } else {
    rv = String(key);
  }

  return rv;
}

function serializeObject(catalog: LookupCatalog, value: object) {
  const record = catalog.lookup(value, TAG_RECURRING_OBJECT);
  let rv;

  if (record.seen) {
    rv = record.name;
  } else {
    record.seen = true;

    if (isSelfSerializableObject(value)) {
      const newValue = serializeSelfSerializable(value);
      rv = recursiveClone(catalog, newValue);
    } else {
      const obj = {} as ISerializeToObject;
      const ownKeys = Reflect.ownKeys(value);

      for (const key of ownKeys) {
        let newKey, newValue;

        if (isSymbol(key)) {
          const { name } = catalog.lookup(key, TAG_SYMBOL);
          newKey = name;
        } else {
          newKey = key;
        }

        try {
          // accessing value by key may throw
          newValue = recursiveClone(catalog, (value as any)[key]);
        } catch (error) {
          newValue = stringifyError(error);
        }

        obj[newKey] = newValue;
      }

      rv = obj;
    }
  }

  return rv;
}

function serializeFunction(value: IFunction): string {
  const fnBody = value.toString();

  if (fnBody.endsWith('{ [native code] }')) {
    return TAG_NATIVE_FUNCTION;
  } else {
    const hash = hashString(fnBody);
    return TAG_FUNCTION(value.name, hash);
  }
}

function serializeSelfSerializable(value: IHasToJSON) {
  let rv;

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
    ? TAG_EXCEPTION(error.toString())
    : TAG_EXCEPTION_FALLBACK;
}

function isNumericSpecials(value: unknown): value is bigint | number {
  return (
    typeof value === 'bigint' ||
    Number.isNaN(value) ||
    value === -Infinity ||
    value === Infinity
  );
}

function isArray(that: unknown): that is unknown[] {
  return (
    that instanceof Array ||
    that instanceof Uint8Array ||
    that instanceof Int8Array ||
    that instanceof Uint8ClampedArray ||
    that instanceof Uint16Array ||
    that instanceof Int16Array ||
    that instanceof Uint32Array ||
    that instanceof Int32Array ||
    that instanceof Float32Array ||
    that instanceof BigUint64Array ||
    that instanceof BigInt64Array ||
    that instanceof Float64Array
  );
}

function isFunction(that: unknown): that is IFunction {
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

function isDOM(that: unknown): that is Element | Document {
  return that instanceof Element || that instanceof Document;
}

function isSymbol(that: unknown): that is Symbol {
  return typeof that === 'symbol';
}

function isObject(that: unknown): that is object {
  return (that !== null && typeof that === 'object') || that instanceof Object;
}

function isRegExp(that: unknown): that is RegExp {
  return that instanceof RegExp;
}
