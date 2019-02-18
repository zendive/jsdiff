![jsdiff](./src/img/panel-icon64.png)
---
Chrome devtools extension
intended to display result of in-memory object comparisons with
the help of dedicated commands invoked via console.

[find at chrome web-store](https://chrome.google.com/webstore/detail/jsdiff-devtool/iefeamoljhdcpigpnpggeiiabpnpgonb)

### Usage basics
Left side for old state, right side for new.
To track changes of the same object in timed manner you can push it with `diffPush` command, 
that will shift objects from right to left, showing differences with previous push state. 

### Example
```javascript
console.diff(left, right);
console.diffLeft(left);
console.diffRight(right);
console.diffPush(next); // private case of console.diff with single argument
```
![screenshot](./doc/screenshot-01.png)

Based on 
===
- [jsondiffpatch](https://github.com/benjamine/jsondiffpatch) by Benjamín Eidelman
- [vuejs](https://github.com/vuejs) by Evan You
