import { customClone, nativeClone } from '@/api/clone';
import { TAG } from '@/api/const';

async function post(
  cloneFn: (value: unknown) => Promise<unknown>,
  payload: ICompareMessagePayload
): Promise<void> {
  try {
    window.postMessage(
      { source: 'jsdiff-console-to-proxy-inprogress', on: true },
      window.location.origin
    );

    for (const key of ['push', 'left', 'right']) {
      if (Reflect.has(payload, key)) {
        const value = payload[key];

        if (value === undefined) {
          payload[key] = TAG.UNDEFINED;
        } else if (value === null) {
          payload[key] = TAG.NULL;
        } else {
          payload[key] = await cloneFn(value);
        }
      }
    }

    window.postMessage(
      { source: 'jsdiff-console-to-proxy-compare', payload },
      window.location.origin
    );
  } catch (e) {
    window.postMessage(
      { source: 'jsdiff-console-to-proxy-inprogress', on: false },
      window.location.origin
    );
  }
}

Object.assign(console, {
  /** diffX experimental custom clone */
  diffX: (...args: unknown[]) => {
    post(
      customClone,
      args.length === 1
        ? { push: args[0], timestamp: Date.now() }
        : { left: args[0], right: args[1], timestamp: Date.now() }
    );
  },
  diff: (...args: unknown[]) => {
    post(
      nativeClone,
      args.length === 1
        ? { push: args[0], timestamp: Date.now() }
        : { left: args[0], right: args[1], timestamp: Date.now() }
    );
  },
  diffLeft: (left: unknown) => {
    post(nativeClone, { left, timestamp: Date.now() });
  },
  diffRight: (right: unknown) => {
    post(nativeClone, { right, timestamp: Date.now() });
  },
  diffPush: (push: unknown) => {
    post(nativeClone, { push, timestamp: Date.now() });
  },
});

console.debug('✚ console.diff()');
