### ![](./src/img/panel-icon28.png) console.diff()
[![console.diff()](https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_206x58.png)](https://chrome.google.com/webstore/detail/jsdiff-devtool/iefeamoljhdcpigpnpggeiiabpnpgonb)

Chrome devtools extension intended to display result of deep in-memory object
comparisons with the help of dedicated console commands.

### Features
* compare objects from multiple tabs and/or between page reloads
* function code included in comparison result in form of a string, may help to see if it was altered
* document, dom-elements and other non-serializable objects are filtered-out from the results
* self recurring references displayed only once, the rest of occurrences are filtered-out  

### API
```javascript
console.diff(left, right);  // compare left and right
console.diff(next);         // shorthand of diffPush while single argumented
console.diffLeft(left);     // update object on the left side only
console.diffRight(right);   // update object on the right side only
console.diffPush(next);     // shifts sides, right becomes left, next becomes right
```

### Usage basics
Historically, left side represents the old state and right side the new state.
* Things that are present on the left side but missing on the right side are colour-coded as red (old).
* Things that are missing on the left side but present on the right side are colour-coded as green (new).

To track changes of the same variable in timed manner you can push it with `diffPush` or `diff`
with a single argument,
that will shift objects from right to left, showing differences with previous push state.

### How it works
* `jsdiff-devtools` registers devtools panel
  * injects console commands that send data to `jsdiff-proxy` 
  * injects `jsdiff-proxy` to farther communicate objects to the extension's `jsdiff-background`
* when `console.diff` command invoked
  * argument/s are cloned in a suitable form for sending between different window contexts and sent to `jsdiff-proxy`
  * `jsdiff-proxy` catches the data and sends it to the `jsdiff-background` where it is stored for future consuming
* when `jsdiff-panel` is mounted (visible in devtools) it listens to data expected to come from the `jsdiff-background`
and displays it

### Screenshot
![screenshot](./src/img/screenshot-01.png)

### Based on
- [jsondiffpatch](https://github.com/benjamine/jsondiffpatch) by Benjamín Eidelman
- [vuejs](https://github.com/vuejs) by Evan You
