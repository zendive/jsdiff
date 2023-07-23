/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/api/const.ts":
/*!**************************!*\
  !*** ./src/api/const.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TAG: () => (/* binding */ TAG)
/* harmony export */ });
const TAG = {
    EMPTY: '(empty)',
    UNDEFINED: '(undefined)',
    NULL: '(null)',
    NATIVE_FUNCTION: '𝑓(native)',
    EXCEPTION_FALLBACK: '⁉️(exception)',
    EXCEPTION: (str) => `⁉️(${str})`,
    RECURRING_ARRAY: (id) => `0x${id}: [♻️]`,
    RECURRING_OBJECT: (id) => `0x${id}: {♻️}`,
    RECURRING_SET: (id) => `0x${id}: Set[♻️]`,
    RECURRING_MAP: (id) => `0x${id}: Map{♻️}`,
    NON_SERIALIZABLE: (id) => `0x${id}: unserializable`,
    SYMBOL: (name, id) => `0x${id}: ${name}`,
    FUCNTION: (hash) => `𝑓(${hash})`,
};


/***/ }),

/***/ "./src/api/proxy.ts":
/*!**************************!*\
  !*** ./src/api/proxy.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   proxyCompareHandler: () => (/* binding */ proxyCompareHandler),
/* harmony export */   proxyInprogressHandler: () => (/* binding */ proxyInprogressHandler),
/* harmony export */   proxyMessageGate: () => (/* binding */ proxyMessageGate)
/* harmony export */ });
/* harmony import */ var _api_const__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/api/const */ "./src/api/const.ts");

function proxyMessageGate(callbackInprogress, callbackCompare) {
    return function (e) {
        if (e.origin === window.location.origin &&
            e.source === window &&
            typeof e.data === 'object' &&
            e.data !== null) {
            if ('jsdiff-console-to-proxy-inprogress' === e.data.source) {
                callbackInprogress(e);
            }
            else if ('jsdiff-console-to-proxy-compare' === e.data.source) {
                callbackCompare(e);
            }
        }
    };
}
async function proxyCompareHandler(e) {
    const current = e.data.payload;
    const { lastApiReq: old } = await chrome.storage.local.get(['lastApiReq']);
    const next = processComparisonObject(old, current);
    await chrome.storage.local.set({ lastApiReq: next });
    chrome.runtime.sendMessage({
        source: 'jsdiff-proxy-to-panel-compare',
    });
}
function proxyInprogressHandler(e) {
    chrome.runtime.sendMessage({
        source: 'jsdiff-proxy-to-panel-inprogress',
        on: e.data.on,
    });
}
function processComparisonObject(old, next) {
    if (!old) {
        old = {
            left: _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.EMPTY,
            right: _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.EMPTY,
            timestamp: Date.now(),
        };
    }
    const rv = old;
    if (Reflect.has(next, 'push')) {
        rv.left = rv.right;
        rv.right = next.push;
    }
    else {
        if (Reflect.has(next, 'left')) {
            rv.left = next.left;
        }
        if (Reflect.has(next, 'right')) {
            rv.right = next.right;
        }
    }
    rv.timestamp = next.timestamp;
    return rv;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*****************************!*\
  !*** ./src/jsdiff-proxy.ts ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _api_proxy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/api/proxy */ "./src/api/proxy.ts");

window.addEventListener('message', (0,_api_proxy__WEBPACK_IMPORTED_MODULE_0__.proxyMessageGate)(_api_proxy__WEBPACK_IMPORTED_MODULE_0__.proxyInprogressHandler, _api_proxy__WEBPACK_IMPORTED_MODULE_0__.proxyCompareHandler));

})();

/******/ })()
;
//# sourceMappingURL=jsdiff-proxy.js.map