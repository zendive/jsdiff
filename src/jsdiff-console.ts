import { post } from './api/clone.ts';

const consoleAPI = {
  diff: (...args: unknown[]) => {
    post(
      args.length === 1
        ? { push: args[0], timestamp: Date.now() }
        : { left: args[0], right: args[1], timestamp: Date.now() }
    );
  },

  diffLeft: (left: unknown) => {
    post({ left, timestamp: Date.now() });
  },

  diffRight: (right: unknown) => {
    post({ right, timestamp: Date.now() });
  },

  diffPush: (push: unknown) => {
    post({ push, timestamp: Date.now() });
  },
};

if (typeof browser === 'undefined') {
  // chrome
  Object.assign(console, consoleAPI);
  console.debug(`✚ console.diff()`);
} else if (typeof cloneInto === 'function') {
  // firefox
  // the technic described in:
  // @link: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts
  window.wrappedJSObject.jsdiff = cloneInto(consoleAPI, window, {
    cloneFunctions: true,
  });
  console.debug(`✚ jsdiff.diff()`);
}
