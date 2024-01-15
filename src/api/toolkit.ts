export function hasValue(o: unknown): boolean {
  return undefined !== o && null !== o;
}

export async function SHA256(data: string): Promise<string> {
  const textAsBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', textAsBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const digest = hashArray
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join('');

  return digest;
}

export function isSearchKeyboardEvent(e: KeyboardEvent) {
  return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f';
}
