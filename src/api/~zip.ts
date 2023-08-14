import pako from 'pako';

export class CompressedLocalStorage {
  static async get(propName: string): Promise<unknown> {
    return CompressedLocalStorage.getEncoded(propName);
    // return CompressedLocalStorage.getAsIs(propName);
  }

  static async set(propName: string, obj: unknown): Promise<void> {
    CompressedLocalStorage.setEncoded(propName, obj);
    // CompressedLocalStorage.setAsIs(propName, obj);
  }

  static async getAsIs(propName: string): Promise<unknown> {
    const storePropName = `${propName}_${storePropNameSufix}`;
    const store = await chrome.storage.local.get([storePropName]);

    return store[storePropName];
  }

  static async setAsIs(propName: string, obj: unknown): Promise<void> {
    const storePropName = `${propName}_${storePropNameSufix}`;
    const store = { [storePropName]: obj };

    await chrome.storage.local.set(store);
  }

  static async getEncoded(propName: string): Promise<unknown> {
    const storePropName = `${propName}_${storePropNameSufix}`;
    const store = await chrome.storage.local.get([storePropName]);
    let rv;

    if (store[storePropName]) {
      rv = decode(store[storePropName]);
    }

    return rv;
  }

  static async setEncoded(propName: string, obj: unknown): Promise<void> {
    const storePropName = `${propName}_${storePropNameSufix}`;
    const encoded = encode(obj);
    const store = { [storePropName]: encoded };

    await chrome.storage.local.set(store);
  }
}

const storePropNameSufix = 'v2';

function encode(obj: unknown): string {
  const objStr = JSON.stringify(obj);
  const uint8 = pako.deflate(objStr);
  const rv = uint8ToString(uint8);

  return rv;
}

function decode(input: string): unknown {
  // Problem in input: char DCD4 -> becomes FFFD FFFD FFFD
  const uint8 = stringToUint8(input);
  const str = pako.inflate(uint8, { to: 'string' });
  const rv = JSON.parse(str);

  return rv;
}

export function uint8ToString(arr: Uint8Array): string {
  const N = arr.length;
  let encodedString = N % 2 === 0 ? '\x00' : '\x01';

  for (let n = 0; n < N; n += 2) {
    const highOrderByte = arr[n];
    const lowOrderByte = n + 1 < N ? arr[n + 1] : 0x00;
    // Padding if odd number of elements

    const combinedWord = (highOrderByte << 8) | lowOrderByte;
    encodedString += String.fromCharCode(combinedWord);
  }

  return encodedString;
}

function stringToUint8(str: string): Uint8Array {
  const isOddLength = str[0] === '\x01';
  const rv: number[] = [];
  const N = str.length;
  const last_n = N - 1;

  for (let n = 1; n < N; n++) {
    const charCode = str.charCodeAt(n);
    const highOrderByte = charCode >> 8;
    const lowOrderByte = (charCode << 8) >> 8;

    rv.push(highOrderByte);

    if (n < last_n || !isOddLength) {
      rv.push(lowOrderByte);
    }
  }

  return Uint8Array.from(rv);
}
