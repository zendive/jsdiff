import { TAG_NULL, TAG_UNDEFINED } from './const.ts';
import { customClone } from './clone.ts';
import type { ICompareMessagePayload } from './proxy.ts';

export function post(payload: ICompareMessagePayload) {
  try {
    globalThis.postMessage(
      { source: 'jsdiff-console-to-proxy-inprogress', on: true },
      '*',
    );

    for (const key of ['push', 'left', 'right']) {
      if (Reflect.has(payload, key)) {
        const value = payload[key];

        if (value === undefined) {
          payload[key] = TAG_UNDEFINED;
        } else if (value === null) {
          payload[key] = TAG_NULL;
        } else {
          payload[key] = customClone(value);
        }
      }
    }

    globalThis.postMessage(
      { source: 'jsdiff-console-to-proxy-compare', payload },
      '*',
    );
  } catch (error) {
    console.error('console.diff()', error);

    globalThis.postMessage(
      { source: 'jsdiff-console-to-proxy-inprogress', on: false },
      '*',
    );
  }
}
