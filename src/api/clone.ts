import { hashString } from './toolkit.ts';
import {
  TAG_DOM_ELEMENT,
  TAG_EXCEPTION,
  TAG_EXCEPTION_FALLBACK,
  TAG_FUNCTION,
  TAG_GLOBAL_SYMBOL,
  TAG_NATIVE_FUNCTION,
  TAG_NUMERIC,
  TAG_RECURRING_ARRAY,
  TAG_RECURRING_MAP,
  TAG_RECURRING_OBJECT,
  TAG_RECURRING_SET,
  TAG_REGEXP,
  TAG_UNDEFINED,
  TAG_UNIQUE_SYMBOL,
  TAG_URL,
} from './const.ts';
import {
  CommonLookupCatalog,
  type TCommonInstanceTag,
  UniqueLookupCatalog,
} from './cloneCatalog.ts';

interface ISerializeToObject {
  [key: string | symbol]: unknown;
}
interface IFunction {
  name: string;
  toString: () => string;
}
interface IHasToJSON {
  toJSON: () => unknown;
}

const symbolCatalog = new UniqueLookupCatalog();
const domCatalog = new UniqueLookupCatalog();

export function customClone(value: unknown) {
  let commonCatalog: CommonLookupCatalog | null = new CommonLookupCatalog();
  const rv = recursiveClone(commonCatalog, value);
  commonCatalog = null;
  return rv;
}

function recursiveClone(commonCatalog: CommonLookupCatalog, value: unknown) {
  let rv = value;

  if (isDOM(value)) {
    rv = domCatalog.lookup(value, TAG_DOM_ELEMENT);
  } else if (isFunction(value)) {
    rv = serializeFunction(value);
  } else if (isSymbol(value)) {
    if (isGlobalSymbol(value)) {
      rv = TAG_GLOBAL_SYMBOL(value);
    } else {
      rv = symbolCatalog.lookup(value, TAG_UNIQUE_SYMBOL);
    }
  } else if (isRegExp(value)) {
    rv = TAG_REGEXP(value);
  } else if (isURL(value)) {
    rv = TAG_URL(value);
  } else if (isArray(value)) {
    rv = serializeArrayAlike(commonCatalog, value, TAG_RECURRING_ARRAY);
  } else if (isSet(value)) {
    rv = serializeArrayAlike(commonCatalog, value, TAG_RECURRING_SET);
  } else if (isMap(value)) {
    rv = serializeMap(commonCatalog, value);
  } else if (isObject(value)) {
    rv = serializeObject(commonCatalog, value);
  } else if (isNumericSpecials(value)) {
    rv = TAG_NUMERIC(value);
  } else if (value === undefined) {
    // JsonDiffPatch has a problem comparing with undefined value - storing a string instead
    rv = TAG_UNDEFINED;
  }

  return rv;
}

function serializeArrayAlike(
  commonCatalog: CommonLookupCatalog,
  array: unknown[] | Set<unknown>,
  badge: TCommonInstanceTag,
): unknown[] | string {
  const record = commonCatalog.lookup(array, badge);
  if (record.seen) {
    return record.name;
  }

  record.seen = true;

  const arr = [];
  for (const v of array) {
    arr.push(recursiveClone(commonCatalog, v));
  }

  return arr;
}

function serializeMap(
  commonCatalog: CommonLookupCatalog,
  value: Map<unknown, unknown>,
) {
  const record = commonCatalog.lookup(value, TAG_RECURRING_MAP);

  if (record.seen) {
    return record.name;
  }

  record.seen = true;

  const obj: ISerializeToObject = {};
  for (const [k, v] of value) {
    const newKey = serializeMapKey(commonCatalog, k);
    const newValue = recursiveClone(commonCatalog, v);

    obj[newKey] = newValue;
  }

  return obj;
}

function serializeMapKey(
  commonCatalog: CommonLookupCatalog,
  key: unknown,
): string {
  let rv;

  if (isDOM(key)) {
    rv = domCatalog.lookup(key, TAG_DOM_ELEMENT);
  } else if (isFunction(key)) {
    rv = serializeFunction(key);
  } else if (isSymbol(key)) {
    rv = isGlobalSymbol(key)
      ? TAG_GLOBAL_SYMBOL(key)
      : symbolCatalog.lookup(key, TAG_UNIQUE_SYMBOL);
  } else if (isRegExp(key)) {
    rv = TAG_REGEXP(key);
  } else if (isURL(key)) {
    rv = TAG_URL(key);
  } else if (isArray(key)) {
    const { name } = commonCatalog.lookup(key, TAG_RECURRING_ARRAY);
    rv = name;
  } else if (isSet(key)) {
    const { name } = commonCatalog.lookup(key, TAG_RECURRING_SET);
    rv = name;
  } else if (isMap(key)) {
    const { name } = commonCatalog.lookup(key, TAG_RECURRING_MAP);
    rv = name;
  } else if (isObject(key)) {
    const { name } = commonCatalog.lookup(key, TAG_RECURRING_OBJECT);
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

function serializeObject(commonCatalog: CommonLookupCatalog, value: object) {
  const record = commonCatalog.lookup(value, TAG_RECURRING_OBJECT);
  if (record.seen) {
    return record.name;
  }

  record.seen = true;

  if (isSelfSerializableObject(value)) {
    const toJsonValue = serializeSelfSerializable(value);
    return recursiveClone(commonCatalog, toJsonValue);
  }

  const rv: ISerializeToObject = {};
  for (const key of Reflect.ownKeys(value)) {
    const { newKey, newValue } = serializeObjectKey(commonCatalog, key, value);
    rv[newKey] = newValue;
  }

  return rv;
}

function serializeObjectKey(
  commonCatalog: CommonLookupCatalog,
  key: string | symbol,
  value: ISerializeToObject,
) {
  let newKey: string, newValue: unknown;

  if (isSymbol(key)) {
    newKey = isGlobalSymbol(key)
      ? TAG_GLOBAL_SYMBOL(key)
      : symbolCatalog.lookup(key, TAG_UNIQUE_SYMBOL);
  } else {
    newKey = key;
  }

  try {
    // accessing value by key may throw
    newValue = recursiveClone(commonCatalog, value[key]);
  } catch (error) {
    newValue = stringifyError(error);
  }

  return { newKey, newValue };
}

function serializeFunction(value: IFunction): string {
  const fnBody = value.toString();

  if (fnBody.endsWith('{ [native code] }')) {
    return TAG_NATIVE_FUNCTION(value.name);
  }

  return TAG_FUNCTION(value.name, hashString(fnBody));
}

function serializeSelfSerializable(value: IHasToJSON) {
  try {
    // rogue object may throw
    return value.toJSON();
  } catch (error) {
    return stringifyError(error);
  }
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
    rv = that !== null &&
      typeof that === 'object' &&
      'toJSON' in that &&
      typeof that.toJSON === 'function';
  } catch (_ignore) {
    rv = false;
  }

  return rv;
}

function isDOM(that: unknown): that is Element | Document {
  return that instanceof Element || that instanceof Document;
}

function isSymbol(that: unknown): that is symbol {
  return typeof that === 'symbol';
}

function isGlobalSymbol(that: symbol): that is symbol {
  return Symbol.keyFor(that) !== undefined;
}

function isObject(that: unknown): that is object {
  return (that !== null && typeof that === 'object') || that instanceof Object;
}

function isRegExp(that: unknown): that is RegExp {
  return that instanceof RegExp;
}

function isURL(that: unknown): that is URL {
  return that instanceof URL;
}
