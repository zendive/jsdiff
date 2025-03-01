### ![](./bundle/img/panel-icon28.png) JSDiff

An extension for developers that enhances the console API by incorporating the ability to compare objects and adds a `JSDiff` tab (parallel to Elements, Network panels) within your dev-tools for viewing the results.

- Available in Chrome Web Store as [console.diff()](https://chromewebstore.google.com/detail/consolediff/iefeamoljhdcpigpnpggeiiabpnpgonb)
- Available in Firefox Add-ons as [jsdiff.diff()](https://addons.mozilla.org/addon/jsdiff-diff/)

<details>
  <summary> <strong>Screenshots</strong> </summary>

- Comparing two objects
  ![screenshot](./doc/screenshot-01.png)

- Tracking changes in `localStorage` (unchanged are hidden)
  ![screenshot](./doc/screenshot-02.png)

</details>

### Motivation

- Track object mutations during runtime and/or while debugging with intention to find expected or unexpected changes.

### Features

- User interface:

  - Hide / show unchanged properties.
  - Copy changed properties in format of `jsondiffpatch` Delta object.
  - Clear current result.
  - Search input to highlight patterns.
    - If search query contains at least one upper-case letter - the search will be case-sensitive.
  - Indicator of the last update time.
  - Indicator of a fatal error (out of storage memory).
  - DevTools light/dark color scheme support.

- Compare objects between multiple [sub]domains, Chrome tabs, or single page reloads.

  - `JSDiff` DevTools panel reflects current state of comparison, regardless the tab[s] it was opened from.

- Fail-safe serialization of objects having security issues while accessing their properties or objects having `toJSON()` function; when instead of serialization of all object properties, - only `toJSON()` return value is serialized, like `JSON.strigify()` does.

- Can be used from within online code editors like: [codesandbox.io](https://codesandbox.io), [coderpad.io](https://coderpad.io), [flems.io](https://flems.io), [codepen.io](https://codepen.io), [jsfiddle.net](https://jsfiddle.net), [mdn playground](https://developer.mozilla.org/play).

#### Limitations

- Map keys like `0` and `'0'` would be merged due to `Map to Object` conversion.

- While paused in debug mode, `JSDiff` panel won't reflect the result until runtime is resumed (see [#10][i10]).

[i10]: https://github.com/zendive/jsdiff/issues/10

- Compared objects, after being serialized, stored in `chrome.storage.local` which has 10 MB limit.

- In Firefox the API is under `jsdiff` object for now, cause extension API's not fully compatible.

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

### Serialization by types

| Input                                                                           | Output                                                                                                   |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| XMLHttpRequest<sup>[1]</sup>                                                    | ƒ XMLHttpRequest⟪native⟫                                                                                 |
| function test(){}<sup>[1]</sup>                                                 | ƒ test⟪1374b28d22b674e53a044425556a9cd48b82fd5aba3bf19e3545d51704227b10⟫                                 |
| document.body                                                                   | {0001}<sup>[2,3]</sup> DOM⟪BODY⟫                                                                         |
| ±Infinity                                                                       | Number⟪±Infinity⟫                                                                                        |
| NaN                                                                             | Number⟪NaN⟫                                                                                              |
| 98765432109876543210n                                                           | BigInt⟪98765432109876543210⟫                                                                             |
| void 0                                                                          | ⟪undefined⟫                                                                                              |
| /example/i                                                                      | RegExp⟪/example/i⟫                                                                                       |
| new URL('https:\//example.com/')                                                | URL⟪https:\//example.com/⟫                                                                               |
| Symbol('example')                                                               | {0001}<sup>[3]</sup> Symbol(example)                                                                     |
| Symbol.for('global')                                                            | Symbol(global)                                                                                           |
| (obj = {key: 1}, {first: obj, second: obj})                                     | {"first": {"key": 1}, "second": "[0002]<sup>[4]</sup> Object⟪♻️⟫"}                                       |
| (key2= {}, map = new Map(\[['key1', 1], [key2, 2]]), {first: map, second: map}) | {"first": {"[0003]<sup>[4,5]</sup> Object⟪♻️⟫": 2, "key1": 1}, "second": "[0002]<sup>[4]</sup> Map⟪♻️⟫"} |
| (arr = [1], {first: arr, second: arr})                                          | {"first": [1], "second": "[0002]<sup>[4]</sup> Array⟪♻️⟫"}                                               |
| (set = new Set([1]), {first: set, second: set})                                 | {"first: [1], "second": "[0002]<sup>[4]</sup> Set⟪♻️⟫"}                                                  |

<sup>1</sup> Functions included in comparison result in order to detect possible alterations, in form of a string combined from a function name (if present) and a hash of a `function.toString()` body.

<sup>2</sup> DOM element serialized by pseudo `id` and `nodeName`.

<sup>3</sup> Notation `{}` denotes pseudo `id` from a Set of unique instances, which is assigned during serialization of compared sides and remains inside internal `WeakMap` lookup catalog until its garbage collected or page is reloaded.

<sup>4</sup> Notation `[]` denotes pseudo `id` from a [Multiset](https://en.wikipedia.org/wiki/Multiset) of recurring instances, which is assigned in the scope of serialization of a high level argument instance, while comparing left or right side; that means - if some object, having `id` of `[0001]` on the left side, is not guarantied to have same `id` on the right side.

<sup>5</sup> `Map` key, unless it's a primitive type, serialized by his pseudo `id`.

#### Typescript

Global Console interface declaration for quick copy/paste when used from typescript:

```typescript
declare global {
  interface Console {
    diff(left: unknown, right?: unknown): void;
    diffPush(next: unknown): void;
    diffLeft(left: unknown): void;
    diffRight(right: unknown): void;
  }
}
```

### Protection

- How to protect your site from this extension:

  - Tests in Chrome show that even `Content-Security-Policy: default-src 'none';` header won't prevent injection of extension content-scripts...

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

### Build instructions

- Linux
- node 22.14 (LTS)

```sh
make install      # install dependencies
make all          # build for prod and make extension.${browser}.zip
make tune2chrome  # or tune2firefox for relevant manifest.json file
make dev          # local development
```

#### Based on

- [jsondiffpatch](https://github.com/benjamine/jsondiffpatch) by Benjamín Eidelman
- [vuejs](https://github.com/vuejs) by Evan You

<details>
  <summary> <strong>Communication schemes between Content-script and DevTools panel</strong> </summary>

- Chrome mv3
  ![screenshot](./doc/design.chrome.png)
- Firefox
  ![screenshot](./doc/design.firefox.png)

</details>
