### ![](./src/img/panel-icon28.png) console.diff()

[![console.diff()](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/tbyBjqi7Zu733AAKA5n4.png)](https://chrome.google.com/webstore/detail/jsdiff-devtool/iefeamoljhdcpigpnpggeiiabpnpgonb)

Chrome extension to compare objects in memory with console.diff(old, new) devtools function.

<details>
  <summary> <strong>Screenshots</strong> </summary>

- Comparing two objects
  ![screenshot](./src/img/screenshot-01.png)

- Tracking changes in localStorage (unchanged are hidden)
  ![screenshot](./src/img/screenshot-02.png)

</details>

### Based on

- [jsondiffpatch](https://github.com/benjamine/jsondiffpatch) by Benjamín Eidelman
- [vuejs](https://github.com/vuejs) by Evan You

### Features

- Symple user interface:

  - Button to hide/show unchanged properties.
  - Button to copy changed properties in format of `jsondiffpatch` diff object.
  - Button to clear current result.
  - Indicator of the last update time.
  - Indicator of a fatal error (out of storage memory).

- Compare objects between multiple [sub]domains, chrome tabs, or single page reloads.

  - JSDiff devtools panel reflects current state of comparison, regardless the tab[s] it was opened from.

- Basic integration with search functionality within devtools:

  - If search query contains at least one upper-case letter - the search will be case-sensitive.

- Using `console.diff` functions from within online code editors like: [codesandbox.io](https://codesandbox.io), [coderpad.io](https://coderpad.io), [flems.io](https://flems.io), [codepen.io](https://codepen.io), [jsfiddle.net](https://jsfiddle.net).

- Functions are included in comparison result in order to detect possible alterations, in form of a string combined from a function name (if present) and a SHA-256 hash of a `function.toString()` body. Native functions are shown as silmply as `ƒ⟪native⟫`.

- Some DOM objects like Document or Element are not worth to be shown entirely, since that is not the purpose of this extension. So if they are present anywhere, they are serialized as `0x####: ⟪unserializable⟫`.

- Object, Array, Map, Set - serialized only once and the rest of their ocurrances are mentioned with unique reference like: `0x####: {♻️}`, `0x####: [♻️]`, `0x####: Map{♻️}`, `0x####: Set[♻️]` respectivly.

  - Map keys, unless they are primitive types, serialized by their pseudo ids.

- Symbols serialized with his pseudo id like: `0x####: Symbol(name)`.

- Serialization of numerics like `+/-Infinity`, `NaN`, `BigInt`, or `undefined` serialized like: `Number⟪Infinity⟫`, `Number⟪NaN⟫`, `BigInt⟪#⟫`, `⟪undefined⟫` respectivly.

- Failsafe serialization of objects having security issues while accessing their properties.

- Failsefe serialization of objects having `toJSON()` function (when instead of serialization of all object properties, - only toJSON() return value is serialized, similar to the way native `JSON.strigify()` works).

### Legend

- Pseudo id, assigned to non-primitive data types, used in order to detect reference recurrences and, in case of Symbols - symbol uniqueness. Id for an object shown in the output only if it seen more than once. It being assigned in the scope of serialization of a high level argument instance, while comparing left or right side; that means if some object, having id 0x0001 on the left side, is not guarantied to have same id on the right side.

### Limitations

- While paused in debug mode, JSDiff panel won't reflect the result until runtime is resumed (see [#10][i10]).

[i10]: https://github.com/zendive/jsdiff/issues/10

- Compared objects, after being serialized, stored in `chrome.storage.local` wich has 10MB limit (before chrome v114 was 5MB).

### API

- **console.diff(left, right)** - compare left and right arguments

```javascript
console.diff({ a: 1, b: 1, c: 3 }, { a: 1, b: 2, d: 3 });
```

- **console.diffPush(next)** - shifts sides, right becomes left, next becomes right

```javascript
console.diffPush(Date.now());
```

- **console.diff(next)** - shorthand for `diffPush`

```javascript
console.diff(Date.now());
```

- **console.diffLeft(left)** - update the old value only

```javascript
console.diffLeft(Date.now());
```

- **console.diffRight(right)** - update the new value only

```javascript
console.diffRight(Date.now());
```

- **console.diff\_(\*)** - uses deprecated `nativeClone` serialization method, based of JSON.parse(JSON.stringify(...)), left for backward compatibility

### Usage basics

Historically, left side represents the old state and right side the new state.

- Things that are present on the left side but missing on the right side are colour-coded as red (old).

- Things that are missing on the left side but present on the right side are colour-coded as green (new).

- To track changes of the same variable in timed manner you can push it with `diffPush` or `diff` with a single argument, - that will shift objects from right to left, showing differences with previous push state.

### How it works

- `manifest.json` injects content scripts to each visited site (except for chrome web store site and google-protected alike):
  - `jsdiff-console.ts` as [MAIN](https://developer.chrome.com/docs/extensions/reference/scripting/#type-ExecutionWorld) world (has access to the target site memory)
    - sends messages to `jsdiff-proxy.ts`.
  - `jsdiff-proxy.ts` as `ISOLATED` world (has access to the chrome runtime)
    - stores data from `jsdiff-console.ts` in `chrome.storage.local` and sends runtime messages to `panel.vue`.
- `jsdiff-devtools.ts` registers `panel.vue` as a JSDiff devtools panel that reads current state of `chorme.storage.local` and listens to incomming `chrome.runtime` mesages from `jsdiff-proxy.ts`.

### How to build

- requires npm/nodejs

```sh
make install # to install dependencies
make all # build for prod and make extension.zip
make dev # local development
```

### Protection

- How to protect your site from this extension:
  - Well, tests show that even `Content-Security-Policy: default-src 'none';` header won't prevent injection of extension content-scripts...
  - Avoid assigning to `window` or `globalThis` any application object.
    See also [accidental global variables and memory leaks](https://www.tutorialspoint.com/explain-in-detail-about-memory-leaks-in-javascript).
  - In general, you can incapacitate console functions:
  ```js
  for (const prop in console) {
    if (typeof console[prop] === 'function' && prop !== 'error') {
      console[prop] = function noop() {};
    }
  }
  ```
