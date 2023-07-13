/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!*******************************!*\
  !*** ./src/jsdiff-console.ts ***!
  \*******************************/

(() => {
    if ('diff' in console && typeof console.diff === 'function') {
        /* already injected */
        console.log('jsdiff-console.ts', 'already here', performance.now());
        return false;
    }
    else {
        console.log('jsdiff-console.ts', performance.now());
    }
    Object.assign(console, {
        diff: () => {
            window.postMessage({
                source: 'jsdiff-console-to-proxy',
                payload: {
                    left: { a: 10, b: 10, c: 30 },
                    right: { a: 10, b: 20, d: 30 },
                    timestamp: Date.now(),
                },
            }, window.location.origin);
            return Date.now();
        },
    });
})();

/******/ })()
;
//# sourceMappingURL=jsdiff-console.js.map