import { post, nativeClone, customClone } from '@/api/clone';

Object.assign(console, {
  diff: (...args: unknown[]) => {
    post(
      customClone,
      args.length === 1
        ? { push: args[0], timestamp: Date.now() }
        : { left: args[0], right: args[1], timestamp: Date.now() }
    );
  },

  diffLeft: (left: unknown) => {
    post(customClone, { left, timestamp: Date.now() });
  },

  diffRight: (right: unknown) => {
    post(customClone, { right, timestamp: Date.now() });
  },

  diffPush: (push: unknown) => {
    post(customClone, { push, timestamp: Date.now() });
  },

  /** @deprecated uses JSON.parse(JSON.stringify(...))*/
  diff_: (...args: unknown[]) => {
    post(
      nativeClone,
      args.length === 1
        ? { push: args[0], timestamp: Date.now() }
        : { left: args[0], right: args[1], timestamp: Date.now() }
    );
  },
});

console.debug(`✚ console.diff()`);
