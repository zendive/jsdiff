import { hashString } from './toolkit.ts';
import {
  TAG_DOM_ELEMENT,
  TAG_EXCEPTION,
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

export interface ISerializableObject {
  [key: string | symbol]: unknown;
}
interface IFunction {
  name: string;
  toString: () => string;
}

const symbolCatalog = new UniqueLookupCatalog();
const domCatalog = new UniqueLookupCatalog();

export function clone(that: unknown) {
  let commonCatalog = new CommonLookupCatalog();

  if (isPrimitive(that)) {
    return serializePrimitive(that, commonCatalog);
  }

  const [rv, record] = getEnvelop(that, commonCatalog)!;
  record.seen = true;
  const stack = [[that, rv]];

  do {
    const [from, to] = stack.shift()!;

    iterate(from, commonCatalog, (value, key) => {
      if (isPrimitive(value)) {
        to[key] = serializePrimitive(value, commonCatalog);
      } else {
        const [envelop, record] = getEnvelop(value, commonCatalog)!;
        if (record.seen) {
          to[key] = record.name;
        } else {
          record.seen = true;
          to[key] = envelop;
          stack.push([value, envelop]);
        }
      }
    });
  } while (stack.length > 0);

  // @ts-ignore: GC hint
  commonCatalog = null;

  return rv;
}

function isPrimitive(that: unknown) {
  const type = typeof that;
  return (
    type === 'number' ||
    type === 'string' ||
    type === 'boolean' ||
    that === undefined ||
    that === null ||
    isFunction(that) ||
    isSymbol(that) ||
    isRegExp(that) ||
    isURL(that) ||
    isNumericSpecials(that) ||
    isDOM(that) ||
    isTypedArray(that)
  );
}

function serializePrimitive(that: unknown, commonCatalog: CommonLookupCatalog) {
  if (isDOM(that)) {
    return domCatalog.lookup(that, TAG_DOM_ELEMENT);
  } else if (isFunction(that)) {
    return serializeFunction(that);
  } else if (isSymbol(that)) {
    if (isGlobalSymbol(that)) {
      return TAG_GLOBAL_SYMBOL(that);
    } else {
      return symbolCatalog.lookup(that, TAG_UNIQUE_SYMBOL);
    }
  } else if (isRegExp(that)) {
    return TAG_REGEXP(that);
  } else if (isURL(that)) {
    return TAG_URL(that);
  } else if (isNumericSpecials(that)) {
    return TAG_NUMERIC(that);
  } else if (that === undefined) {
    // JsonDiffPatch has a problem comparing with undefined value - storing as string instead
    return TAG_UNDEFINED;
  } else if (isTypedArray(that)) {
    return serializeTypedArray(that, commonCatalog, TAG_RECURRING_ARRAY);
  }

  return that;
}

function getEnvelop(that: unknown, commonCatalog: CommonLookupCatalog) {
  if (Array.isArray(that)) {
    return [
      new Array(that.length),
      commonCatalog.lookup(that, TAG_RECURRING_ARRAY),
    ];
  } else if (isSet(that)) {
    return [
      new Array(that.size),
      commonCatalog.lookup(that, TAG_RECURRING_SET),
    ];
  } else if (isMap(that)) {
    return [Object.create(null), commonCatalog.lookup(that, TAG_RECURRING_MAP)];
  } else if (isObject(that)) {
    return [
      Object.create(null),
      commonCatalog.lookup(that, TAG_RECURRING_OBJECT),
    ];
  } else {
    throw new TypeError(
      `getEnvelop for: ${typeof that}; ${
        Object.prototype.toString.call(that)
      }; ${String(that)}?`,
    );
  }
}

function iterate<
  TIterable,
  TIterableKey extends keyof TIterable,
>(
  that: TIterable,
  commonCatalog: CommonLookupCatalog,
  fn: (value: unknown, key: TIterableKey) => void,
) {
  if (Array.isArray(that) || isSet(that)) {
    let n = 0;
    for (const v of that) {
      fn(v, n++ as TIterableKey);
    }
  } else if (isMap(that)) {
    that.forEach((v, k) => {
      fn(v, serializeMapKey(k, commonCatalog) as TIterableKey);
    });
  } else if (isObject(that)) {
    const keys = Reflect.ownKeys(that);

    if (!keys.length) {
      for (const k in that) keys.push(k);
    }

    for (let key of keys) {
      // accessing object by key may throw
      let value;
      try {
        value = that[key];
      } catch (error) {
        value = stringifyError(error);
      }

      if (isSymbol(key)) {
        key = serializeSymbol(key);
      }

      fn(value, key as TIterableKey);
    }
  }
}

function serializeTypedArray(
  array: ArrayLike<number>,
  commonCatalog: CommonLookupCatalog,
  badge: TCommonInstanceTag,
) {
  const record = commonCatalog.lookup(array, badge);
  if (record.seen) {
    return record.name;
  }

  record.seen = true;

  if (typeof array[0] === 'bigint') {
    return Array.from(array, (v) => `${v}n`);
  } else {
    return Array.from(array);
  }
}

function serializeMapKey(
  key: unknown,
  commonCatalog: CommonLookupCatalog,
): string {
  if (isDOM(key)) {
    return domCatalog.lookup(key, TAG_DOM_ELEMENT);
  } else if (isFunction(key)) {
    return serializeFunction(key);
  } else if (isSymbol(key)) {
    return serializeSymbol(key);
  } else if (isRegExp(key)) {
    return TAG_REGEXP(key);
  } else if (isURL(key)) {
    return TAG_URL(key);
  } else if (isNumericSpecials(key)) {
    return TAG_NUMERIC(key);
  } else if (key === undefined) {
    return TAG_UNDEFINED;
  } else if (Array.isArray(key) || isTypedArray(key)) {
    return commonCatalog.lookup(key, TAG_RECURRING_ARRAY).name;
  } else if (isSet(key)) {
    return commonCatalog.lookup(key, TAG_RECURRING_SET).name;
  } else if (isMap(key)) {
    return commonCatalog.lookup(key, TAG_RECURRING_MAP).name;
  } else if (isObject(key)) {
    return commonCatalog.lookup(key, TAG_RECURRING_OBJECT).name;
  } else {
    return String(key);
  }
}

function serializeFunction(value: IFunction): string {
  const fnBody = value.toString();

  if (fnBody.lastIndexOf('[native code]') > 0) {
    return TAG_NATIVE_FUNCTION(value.name);
  }

  return TAG_FUNCTION(value.name, hashString(fnBody));
}

function serializeSymbol(value: symbol) {
  return isGlobalSymbol(value)
    ? TAG_GLOBAL_SYMBOL(value)
    : symbolCatalog.lookup(value, TAG_UNIQUE_SYMBOL);
}

function stringifyError(error: unknown) {
  if (!Error.isError(error)) {
    error = new Error(String(error));
  }
  return TAG_EXCEPTION(error);
}

function isNumericSpecials(value: unknown): value is bigint | number {
  return (
    typeof value === 'bigint' ||
    Number.isNaN(value) ||
    value === -Infinity ||
    value === Infinity
  );
}

function isFunction(that: unknown): that is IFunction {
  return (
    typeof that === 'function' &&
    'toString' in that &&
    typeof that.toString === 'function'
  );
}

function isTypedArray(that: unknown): that is ArrayLike<number> {
  return ArrayBuffer.isView(that) && !(that instanceof DataView);
}

function isSet(that: unknown): that is Set<unknown> {
  return Object.prototype.toString.call(that) === '[object Set]';
}

function isMap(that: unknown): that is Map<unknown, unknown> {
  return Object.prototype.toString.call(that) === '[object Map]';
}

function isObject(that: unknown): that is ISerializableObject {
  return (that !== null && typeof that === 'object');
}

function isDOM(that: unknown): that is Element | Document {
  return that instanceof Element || that instanceof Document;
}

function isSymbol(that: unknown): that is symbol {
  return typeof that === 'symbol';
}

function isGlobalSymbol(that: symbol): boolean {
  return Symbol.keyFor(that) !== undefined;
}

function isRegExp(that: unknown): that is RegExp {
  return that instanceof window.RegExp;
}

function isURL(that: unknown): that is URL {
  return that instanceof URL;
}

/**
 * @note: use when reoccurrence is not expected
 * @param that - expects object | array | primitives, nothing else exotic
 */
export function stripDeepObjectPrototype<T>(that: T): T {
  if (that === null || typeof that !== 'object') {
    return that;
  }

  const rv = Array.isArray(that) ? [] : Object.create(null);
  const stack = [[that, rv]];

  do {
    const [from, to] = stack.shift()!;

    for (const key in from) {
      if (!Object.prototype.hasOwnProperty.call(from, key)) {
        continue;
      }

      const value = from[key];

      if (value !== null && typeof value === 'object') {
        const subEnvelop = Array.isArray(value)
          ? new Array(value.length)
          : Object.create(null);

        to[key] = subEnvelop;
        stack.push([value, subEnvelop]);
      } else {
        to[key] = value;
      }
    }
  } while (stack.length > 0);

  return rv;
}
