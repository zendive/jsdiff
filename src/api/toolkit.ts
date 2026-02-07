import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';

export function hasValue(o: unknown): boolean {
  return undefined !== o && null !== o;
}

export function hashString(str: string) {
  return bytesToHex(sha256(utf8ToBytes(str)));
}

export function isSearchKeyboardEvent(e: KeyboardEvent) {
  return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f';
}

export function escapeHTML(str: string) {
  return str.replace(
    /[&<>"']/g,
    (match) =>
      (<Record<string, string>> {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[match],
  );
}
