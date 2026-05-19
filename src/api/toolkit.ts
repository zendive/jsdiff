import { sha256 } from '@awasm/noble/js.js';

export function hasValue(o: unknown): boolean {
  return undefined !== o && null !== o;
}

const te = /*@__PURE__*/ (() => new TextEncoder())();
const uint8buffer = /*@__PURE__*/ (() => new Uint8Array(sha256.outputLen))();

export function hashString(str: string) {
  return sha256(te.encode(str), { out: uint8buffer }).toHex();
}

export function isSearchKeyboardEvent(e: KeyboardEvent) {
  return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f';
}
