import { SHA256 } from '@/api/toolkit.ts';
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
  TAG_SYMBOL,
  TAG_UNDEFINED,
  TAG_UNSERIALIZABLE,
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

class ObjectsCatalog {
  #records: Map<unknown, ICatalogRecord>;
  #instanceCounter = 0;

  constructor() {
    this.#records = new Map();
  }

  clear() {
    this.#records.clear();
  }

  #counterToString(counter: number): string {
    return counter.toString(16).padStart(4, '0');
  }

  lookup(
    value: unknown,
    badge: TInstanceBadgeTag | TSymbolBadgeTag
  ): ICatalogRecord {
    let record = this.#records.get(value);

    if (!record) {
      ++this.#instanceCounter;
      const id = this.#counterToString(this.#instanceCounter);
      record = {
        name: isSymbol(value)
          ? (badge as TSymbolBadgeTag)(value.toString(), id)
          : (badge as TInstanceBadgeTag)(id),
        seen: false,
      };
      this.#records.set(value, record);
    }

    return record;
  }
}

export async function post(payload: ICompareMessagePayload): Promise<void> {
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
          payload[key] = await customClone(value);
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

export async function customClone(value: unknown): Promise<unknown> {
  let catalog: ObjectsCatalog | null = new ObjectsCatalog();
  const rv = await recursiveClone(catalog, value);

  catalog.clear();
  catalog = null;

  return rv;
}

async function recursiveClone(
  catalog: ObjectsCatalog,
  value: unknown
): Promise<unknown> {
  let rv = value;

  if (isUnserializable(value)) {
    const { name } = catalog.lookup(value, TAG_UNSERIALIZABLE);
    rv = name;
  } else if (isFunction(value)) {
    rv = await serializeFunction(value);
  } else if (isSymbol(value)) {
    const { name } = catalog.lookup(value, TAG_SYMBOL);
    rv = name;
  } else if (isArray(value)) {
    rv = await serializeArrayAlike(catalog, value, TAG_RECURRING_ARRAY);
  } else if (isSet(value)) {
    rv = await serializeArrayAlike(catalog, value, TAG_RECURRING_SET);
  } else if (isMap(value)) {
    rv = await serializeMap(catalog, value);
  } else if (isObject(value)) {
    rv = await serializeObject(catalog, value);
  } else if (isNumericSpecials(value)) {
    rv = TAG_NUMERIC(value);
  } else if (value === undefined) {
    // JsonDiffPatch has problem identifying undefined value - storing a string instead
    rv = TAG_UNDEFINED;
  }

  return rv;
}

function isNumericSpecials(value: unknown): value is bigint | number {
  return (
    typeof value === 'bigint' ||
    Number.isNaN(value) ||
    value === -Infinity ||
    value === Infinity
  );
}

async function serializeArrayAlike(
  catalog: ObjectsCatalog,
  value: unknown[] | Set<unknown>,
  badge: TInstanceBadgeTag
): Promise<unknown[] | string> {
  const record = catalog.lookup(value, badge);
  let rv;

  if (record.seen) {
    rv = record.name;
  } else {
    record.seen = true;
    const arr = [];

    for (const v of value) {
      arr.push(await recursiveClone(catalog, v));
    }

    rv = arr;
  }

  return rv;
}

async function serializeMap(
  catalog: ObjectsCatalog,
  value: Map<unknown, unknown>
): Promise<unknown> {
  const record = catalog.lookup(value, TAG_RECURRING_MAP);
  let rv;

  if (record.seen) {
    rv = record.name;
  } else {
    record.seen = true;
    const obj = {} as ISerializeToObject;

    for (const [k, v] of value) {
      const newKey = await serializeMapKey(catalog, k);
      const newValue = await recursiveClone(catalog, v);

      obj[newKey] = newValue;
    }

    rv = obj;
  }

  return rv;
}

async function serializeMapKey(
  catalog: ObjectsCatalog,
  key: unknown
): Promise<string> {
  let rv;

  if (isUnserializable(key)) {
    const { name } = catalog.lookup(key, TAG_UNSERIALIZABLE);
    rv = name;
  } else if (isFunction(key)) {
    rv = await serializeFunction(key);
  } else if (isSymbol(key)) {
    const { name } = catalog.lookup(key, TAG_SYMBOL);
    rv = name;
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

async function serializeObject(
  catalog: ObjectsCatalog,
  value: object
): Promise<unknown> {
  const record = catalog.lookup(value, TAG_RECURRING_OBJECT);
  let rv;

  if (record.seen) {
    rv = record.name;
  } else {
    record.seen = true;

    if (isSelfSerializableObject(value)) {
      const newValue = serializeSelfSerializable(value);
      rv = await recursiveClone(catalog, newValue);
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
          newValue = await recursiveClone(catalog, (value as any)[key]);
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

async function serializeFunction(value: IFunction): Promise<string> {
  const fnBody = value.toString();

  if (fnBody.endsWith('{ [native code] }')) {
    return TAG_NATIVE_FUNCTION;
  } else {
    const hash = await SHA256(fnBody);
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

function isUnserializable(that: unknown): boolean {
  return that instanceof Element || that instanceof Document;
}

function isSymbol(that: unknown): that is Symbol {
  return typeof that === 'symbol';
}

function isObject(that: unknown): that is object {
  return (that !== null && typeof that === 'object') || that instanceof Object;
}
