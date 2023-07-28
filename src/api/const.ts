export const TAG = {
  EMPTY: '⟪empty⟫',
  UNDEFINED: '⟪undefined⟫',
  NULL: '⟪null⟫',
  NATIVE_FUNCTION: 'ƒ⟪native⟫',
  EXCEPTION_FALLBACK: '⁉️ ⟪exception⟫',
  EXCEPTION: (str: string) => `⁉️ ⟪${str}⟫`,
  RECURRING_ARRAY: (id: string) => `0x${id}: [♻️]`,
  RECURRING_OBJECT: (id: string) => `0x${id}: {♻️}`,
  RECURRING_SET: (id: string) => `0x${id}: Set[♻️]`,
  RECURRING_MAP: (id: string) => `0x${id}: Map{♻️}`,
  UNSERIALIZABLE: (id: string) => `0x${id}: ⟪unserializable⟫`,
  SYMBOL: (name: string, id: string) => `0x${id}: ${name}`,
  FUNCTION: (name: string, hash: string) =>
    `ƒ${name ? ` ${name}` : ''}⟪${hash}⟫`,
  NUMERIC: (value: bigint | number) =>
    typeof value === 'bigint' ? `BigInt⟪${value}⟫` : `Number⟪${value}⟫`,
};

export const ERROR = {
  NO_CONNECTION:
    'Could not establish connection. Receiving end does not exist.',
  PORT_CLOSED: 'The message port closed before a response was received.',
  QUOTA_EXCEEDED: 'QUOTA_BYTES quota exceeded',
};
