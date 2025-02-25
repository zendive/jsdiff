export const APP_DIFFAPI = 'https://github.com/benjamine/jsondiffpatch';
export const APP_CODE_EXAMPLE = `${typeof browser !== 'undefined' ? 'jsdiff' : 'console'}.diff({a:1,b:1,c:3}, {a:1,b:2,d:3});`;
export const TAG_EMPTY = '⟪empty⟫';
export const TAG_UNDEFINED = '⟪undefined⟫';
export const TAG_NULL = '⟪null⟫';
export const TAG_NATIVE_FUNCTION = 'ƒ⟪native⟫';
export const TAG_EXCEPTION_FALLBACK = '⁉️ ⟪exception⟫';
export const TAG_EXCEPTION = (str: string) => `⁉️ ⟪${str}⟫`;
export const TAG_RECURRING_ARRAY = (id: string) => `0x${id}: [♻️]`;
export const TAG_RECURRING_OBJECT = (id: string) => `0x${id}: {♻️}`;
export const TAG_RECURRING_SET = (id: string) => `0x${id}: Set[♻️]`;
export const TAG_RECURRING_MAP = (id: string) => `0x${id}: Map{♻️}`;
export const TAG_DOM_ELEMENT = (id: string) => `0x${id}: ⟪DOM⟫`;
export const TAG_UNIQUE_SYMBOL = (smbl: symbol, id: string) =>
  `0x${id}: ${smbl.toString()}`;
export const TAG_GLOBAL_SYMBOL = (smbl: symbol) => `${smbl.toString()}`;
export const TAG_FUNCTION = (name: string, hash: string) =>
  `ƒ${name ? ` ${name}` : ''}⟪${hash}⟫`;
export const TAG_NUMERIC = (value: bigint | number) =>
  typeof value === 'bigint' ? `BigInt⟪${value}⟫` : `Number⟪${value}⟫`;
export const TAG_REGEXP = (value: RegExp) => `RegExp⟪${value}⟫`;
export const TAG_URL = (value: URL) => `URL⟪${value}⟫`;
export const ERROR_NO_CONNECTION =
  'Could not establish connection. Receiving end does not exist.';
export const ERROR_PORT_CLOSED =
  'The message port closed before a response was received.';
export const ERROR_QUOTA_EXCEEDED = 'QUOTA_BYTES quota exceeded';
export const BACKGROUND_SCRIPT_CONNECTION_INTERVAL = 30e3;
export const BACKGROUND_SCRIPT_CONNECTION_NAME = 'jsdiff-devtools-page-connect';
export const UPPERCASE_PATTERN = /\p{Lu}/u; // 'u' flag enables Unicode matching
