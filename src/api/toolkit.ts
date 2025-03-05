import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex } from '@noble/hashes/utils';

export function hasValue(o: unknown): boolean {
  return undefined !== o && null !== o;
}

export function hashString(str: string) {
  return bytesToHex(sha256(str));
}

export function isSearchKeyboardEvent(e: KeyboardEvent) {
  return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f';
}

export function escapeHTML(str: string) {
  return str.replace(
    /[&<>"']/g,
    (match) =>
      (<Record<string, string>>{
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[match]
  );
}
