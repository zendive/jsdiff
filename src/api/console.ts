/**
 * @returns {boolean} injected or not injected
 */
export function define_console_api(): boolean {
  function nativeClone(value: unknown) {
    function nativeClonePostDataAdapter(
      set: Set<unknown>,
      key: string | Symbol,
      value: unknown
    ) {
      try {
        if (value instanceof Element || value instanceof Document) {
          return undefined;
        } else if (typeof value === 'function') {
          return value.toString();
        } else if (value instanceof Object || typeof value === 'object') {
          if (set.has(value)) {
            return undefined;
          }
          set.add(value);
        }

        return value;
      } catch (ignore) {
        return undefined;
      }
    }

    let set: Set<unknown> | null = new Set();
    const rv = JSON.parse(
      JSON.stringify(value, nativeClonePostDataAdapter.bind(null, set))
    );

    set.clear();
    set = null;

    return rv;
  }

  function post(payload: ICompareMessagePayload) {
    try {
      ['push', 'left', 'right'].forEach((key) => {
        if (Reflect.has(payload, key)) {
          const value = payload[key];

          if (value === undefined) {
            payload[key] = '(undefined)';
          } else if (value === null) {
            payload[key] = '(null)';
          } else {
            payload[key] = nativeClone(value);
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

  if ('diff' in console && typeof console.diff === 'function') {
    /* already injected */
    return false;
  } else {
    Object.assign(console, {
      diff: (...args: unknown[]) =>
        post(
          args.length === 1
            ? { push: args[0], timestamp: Date.now() }
            : { left: args[0], right: args[1], timestamp: Date.now() }
        ),
      diffLeft: (left: unknown) => post({ left, timestamp: Date.now() }),
      diffRight: (right: unknown) => post({ right, timestamp: Date.now() }),
      diffPush: (push: unknown) => post({ push, timestamp: Date.now() }),
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

    return true;
  }
}
