# jsdiff
Show diff between 2 objects in a popup window

Example
====
![screenshot](./doc/screenshot.png)

```javascript
// api is exposed to global context
jsdiff.show(objLeft, objRight);

// and/or could be used as amd module
define(['path/to/jsdiff'], function (jsdiff) {
    jsdiff.show(objLeft, objRight);
});
```

Could be useful while comparing complex objects with big amount of data.

TODO
====
 [-] DevTools chrome extension

Based on 
====
[jsondiffpatch](https://github.com/benjamine/jsondiffpatch) by benjamine
