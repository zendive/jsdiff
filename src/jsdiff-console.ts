import { customClone, nativeClone } from '@/api/clone';
import { TAG } from '@/api/const';

function post(
  cloneFn: (value: unknown) => unknown,
  payload: ICompareMessagePayload
) {
  try {
    ['push', 'left', 'right'].forEach((key) => {
      if (Reflect.has(payload, key)) {
        const value = payload[key];

        if (value === undefined) {
          payload[key] = TAG.VALUE_IS_UNDEFINED;
        } else if (value === null) {
          payload[key] = TAG.VALUE_IS_NULL;
        } else {
          payload[key] = cloneFn(value);
        }
      }
    });

    window.postMessage(
      {
        source: 'jsdiff-console-to-proxy',
        payload,
      },
      window.location.origin
    );
  } catch (e) {
    console.error(
      '%cconsole.diff()',
      `
          font-weight: 700;
          color: #000;
          background-color: #ffbbbb;
          padding: 2px 4px;
          border: 1px solid #bbb;
          border-radius: 4px;
        `,
      e
    );
  }
}

Object.assign(console, {
  /** experimental */
  diffX: (...args: unknown[]) =>
    post(
      customClone,
      args.length === 1
        ? { push: args[0], timestamp: Date.now() }
        : { left: args[0], right: args[1], timestamp: Date.now() }
    ),
  diff: (...args: unknown[]) =>
    post(
      nativeClone,
      args.length === 1
        ? { push: args[0], timestamp: Date.now() }
        : { left: args[0], right: args[1], timestamp: Date.now() }
    ),
  diffLeft: (left: unknown) =>
    post(nativeClone, { left, timestamp: Date.now() }),
  diffRight: (right: unknown) =>
    post(nativeClone, { right, timestamp: Date.now() }),
  diffPush: (push: unknown) =>
    post(nativeClone, { push, timestamp: Date.now() }),
});

console.debug(
  '%c✚ console.diff()',
  `
      font-weight: 700;
      color: #000;
      background-color: yellow;
      padding: 2px 4px;
      border: 1px solid #bbb;
      border-radius: 4px;
    `
);
