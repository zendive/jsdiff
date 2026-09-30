export const APP_DIFFAPI = 'https://github.com/benjamine/jsondiffpatch';
export const TAG_EMPTY = '⟪empty⟫';
export const TAG_UNDEFINED = '⟪undefined⟫';
export const TAG_EXCEPTION = (str: unknown | Error) => `⁉️ ⟪exception: ${str}⟫`;
const TYPE_NAME_PATTERN = /.*\s(.+)]/;
export const TAG_RECURRING_ARRAY = (id: string, value: unknown) => {
  const type = Object.prototype.toString.call(value);
  const name = type.replace(TYPE_NAME_PATTERN, '$1');

  return `[${id}] ${name}⟪♻️⟫`;
};
export const TAG_RECURRING_OBJECT = (id: string) => `[${id}] Object⟪♻️⟫`;
export const TAG_RECURRING_SET = (id: string) => `[${id}] Set⟪♻️⟫`;
export const TAG_RECURRING_MAP = (id: string) => `[${id}] Map⟪♻️⟫`;
export const TAG_DOM_ELEMENT = (id: string, value: Document | Element) => {
  try {
    return `{${id}} DOM⟪${value.nodeName}⟫`;
  } catch (_ignore) {
    return `{${id}} DOM⟪⁉️⟫`;
  }
};
export const TAG_UNIQUE_SYMBOL = (id: string, value: symbol) =>
  `{${id}} ${value.toString()}`;
export const TAG_GLOBAL_SYMBOL = (smbl: symbol) => `${smbl.toString()}`;
export const TAG_NATIVE_FUNCTION = (name: string) =>
  `ƒ${name ? ` ${name}` : ''}⟪native⟫`;
export const TAG_FUNCTION = (name: string, hash: string) =>
  `ƒ${name ? ` ${name}` : ''}⟪${hash}⟫`;
export const TAG_NUMERIC = (value: bigint | number) =>
  typeof value === 'bigint' ? `${value}n` : `Number⟪${value}⟫`;
export const TAG_REGEXP = (value: RegExp) => `RegExp⟪${value}⟫`;
export const TAG_URL = (value: URL) => `URL⟪${value}⟫`;
export const ERROR_NO_CONNECTION =
  'Could not establish connection. Receiving end does not exist.';
export const ERROR_PORT_CLOSED =
  'The message port closed before a response was received.';
export const BACKGROUND_SCRIPT_CONNECTION_NAME = 'jsdiff-devtools-page-connect';
export const UPPERCASE_PATTERN = /\p{Lu}/u; // 'u' flag enables Unicode matching
