import { sha256 } from '@noble/hashes/sha2.js';
import { utf8ToBytes } from '@noble/hashes/utils.js';

export function hasValue(o: unknown): boolean {
  return undefined !== o && null !== o;
}

export function hashString(str: string) {
  return sha256(utf8ToBytes(str)).toHex();
}

export function isSearchKeyboardEvent(e: KeyboardEvent) {
  return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f';
}
