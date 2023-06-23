### ![](./src/img/panel-icon28.png) console.diff()

[![console.diff()](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/tbyBjqi7Zu733AAKA5n4.png)](https://chrome.google.com/webstore/detail/jsdiff-devtool/iefeamoljhdcpigpnpggeiiabpnpgonb)

Chrome devtools extension intended to display result of deep in-memory object
comparisons with the help of dedicated console commands.

### Based on

- [jsondiffpatch](https://github.com/benjamine/jsondiffpatch) by Benjamín Eidelman
- [vuejs](https://github.com/vuejs) by Evan You

### Features

- compare objects from multiple tabs and/or between page reloads
- function code included in comparison result in form of a string, may help to see if it was altered
- document, dom-elements and other non-serializable objects are filtered-out from the results
- self recurring references displayed only once, the rest of occurrences are filtered-out
- basic integration with search functionality within devtools

### Limitations and workarounds

- some instances of objects may cause exception during preparations for comparison
  - try to narrow compared contexts
  - if it's some Browser API that causes an exception and not a framework, consider opening an issue,
    so it will be possible to solve it on a permanent basis
- while paused in debug mode, JSDiff panel won't reflect the result until runtime is resumed ([#10][i10])

[i10]: https://github.com/zendive/jsdiff/issues/10

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

- **console.diffLeft(left)** - update the old value

```javascript
console.diffLeft(Date.now());
```

- **console.diffRight(right)** - update the new value

```javascript
console.diffRight(Date.now());
```

### Usage basics

Historically, left side represents the old state and right side the new state.

- Things that are present on the left side but missing on the right side are colour-coded as red (old).
- Things that are missing on the left side but present on the right side are colour-coded as green (new).

To track changes of the same variable in timed manner you can push it with `diffPush` or `diff`
with a single argument, that will shift objects from right to left, showing differences with previous push state.

### How it works

- `jsdiff-devtools.js` registers devtools panel
  - injects `console.diff` commands into inspected window's console interface
    - each function clones arguments and sends them via `postMessage` to `jsdiff-proxy.js` in `jsdiff-console-to-proxy` message
  - injects `jsdiff-proxy.js` that listens on window `jsdiff-console-to-proxy` message and sends it further to chrome runtime in `jsdiff-proxy-to-devtools` message
  - listens on `jsdiff-proxy-to-devtools` and prepares payload for `vue/panel.js` and sends it with `jsdiff-devtools-to-panel-compare` message
  - when user invokes devtools search command - informs `vue/panel.js` with `jsdiff-devtools-to-panel-search` message
- when `vue/panel.js` is visible in devtools
  - reflects result of last compare request
  - listens on `jsdiff-devtools-to-panel-compare` requests
  - listens on `jsdiff-devtools-to-panel-search` and tries to find query in DOM
    - if search query contains upper-case letter - the search will be case-sensitive

### Screenshot

![screenshot](./src/img/screenshot-01.png)
