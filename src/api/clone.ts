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
interface ICatalogRecord {
  name: string;
  seen: boolean;
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
    const { name } = catalog.lookup(value, TAG.UNSERIALIZABLE);
    rv = name;
  } else if (isFunction(value)) {
    rv = await serializeFunction(value);
  } else if (isSymbol(value)) {
    const { name } = catalog.lookup(value, TAG.SYMBOL);
    rv = name;
  } else if (isArray(value)) {
    rv = await serializeArrayAlike(catalog, value, TAG.RECURRING_ARRAY);
  } else if (isSet(value)) {
    rv = await serializeArrayAlike(catalog, value, TAG.RECURRING_SET);
  } else if (isMap(value)) {
    rv = await serializeMap(catalog, value);
  } else if (isObject(value)) {
    rv = await serializeObject(catalog, value);
  } else if (value === undefined) {
    // JsonDiffPatch has problem identifying undefined value - storing a string instead
    rv = TAG.UNDEFINED;
  }

  return rv;
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
  const record = catalog.lookup(value, TAG.RECURRING_MAP);
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
    const { name } = catalog.lookup(key, TAG.UNSERIALIZABLE);
    rv = name;
  } else if (isFunction(key)) {
    rv = await serializeFunction(key);
  } else if (isSymbol(key)) {
    const { name } = catalog.lookup(key, TAG.SYMBOL);
    rv = name;
  } else if (isArray(key)) {
    const { name } = catalog.lookup(key, TAG.RECURRING_ARRAY);
    rv = name;
  } else if (isSet(key)) {
    const { name } = catalog.lookup(key, TAG.RECURRING_SET);
    rv = name;
  } else if (isMap(key)) {
    const { name } = catalog.lookup(key, TAG.RECURRING_MAP);
    rv = name;
  } else if (isObject(key)) {
    const { name } = catalog.lookup(key, TAG.RECURRING_OBJECT);
    rv = name;
  } else {
    rv = String(key);
  }

  return rv;
}

async function serializeObject(
  catalog: ObjectsCatalog,
  value: object
): Promise<unknown> {
  const record = catalog.lookup(value, TAG.RECURRING_OBJECT);
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
          const { name } = catalog.lookup(key, TAG.SYMBOL);
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
  return (that !== null && typeof that === 'object') || that instanceof Object;
}
