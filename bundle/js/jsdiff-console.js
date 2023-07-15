/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/api/clone.ts":
/*!**************************!*\
  !*** ./src/api/clone.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   customClone: () => (/* binding */ customClone),
/* harmony export */   nativeClone: () => (/* binding */ nativeClone)
/* harmony export */ });
/* harmony import */ var _api_const__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/api/const */ "./src/api/const.ts");

function nativeClonePostDataAdapter(set, key, value) {
    try {
        if (isNonSerializable(value)) {
            return undefined;
        }
        else if (isFunction(value)) {
            return value.toString();
        }
        else if (value instanceof Object || typeof value === 'object') {
            if (set.has(value)) {
                return undefined;
            }
            set.add(value);
        }
        return value;
    }
    catch (ignore) {
        return undefined;
    }
}
function nativeClone(value) {
    let set = new Set();
    const rv = JSON.parse(JSON.stringify(value, nativeClonePostDataAdapter.bind(null, set)));
    set.clear();
    set = null;
    return rv;
}
function isArray(that) {
    return (that instanceof Array ||
        that instanceof Uint8Array ||
        that instanceof Uint8ClampedArray ||
        that instanceof Uint16Array ||
        that instanceof Uint32Array ||
        that instanceof BigUint64Array ||
        that instanceof Int8Array ||
        that instanceof Int16Array ||
        that instanceof Int32Array ||
        that instanceof BigInt64Array);
}
function isFunction(that) {
    return (typeof that === 'function' &&
        'toString' in that &&
        typeof that.toString === 'function');
}
function isSelfSerializableObject(that) {
    return (that !== null &&
        typeof that === 'object' &&
        'toJSON' in that &&
        typeof that.toJSON === 'function');
}
function isNonSerializable(that) {
    return that instanceof Element || that instanceof Document;
}
function isSymbol(that) {
    return typeof that === 'symbol';
}
function isObject(that) {
    return that instanceof Object || typeof that === 'object';
}
function clone(weakSet, value) {
    let rv;
    if (isNonSerializable(value)) {
        rv = undefined;
    }
    else if (isArray(value)) {
        rv = [];
        for (const v of value) {
            rv.push(clone(weakSet, v)); // recursion
        }
    }
    else if (isSymbol(value)) {
        rv = value.toString();
    }
    else if (isObject(value)) {
        if (isSelfSerializableObject(value)) {
            try {
                // rogue object may throw
                rv = value.toJSON();
            }
            catch (error) {
                rv =
                    typeof error?.toString === 'function'
                        ? error.toString()
                        : _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.EXCEPTION;
            }
        }
        else {
            rv = {};
            const ownKeys = Reflect.ownKeys(value);
            // TODO: ...
        }
    }
    return rv;
}
function customClone(value) {
    let ws = new WeakSet();
    const rv = clone(ws, value);
    ws = null;
    return rv;
}


/***/ }),

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
    EXCEPTION: '👉️exception👈️',
    VALUE_IS_EMPTY: '👉️empty👈️',
    VALUE_IS_UNDEFINED: '👉️undefined👈️',
    VALUE_IS_NULL: '👉️null👈️',
};


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
/*!*******************************!*\
  !*** ./src/jsdiff-console.ts ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _api_clone__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/api/clone */ "./src/api/clone.ts");
/* harmony import */ var _api_const__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/api/const */ "./src/api/const.ts");


function post(cloneFn, payload) {
    try {
        ['push', 'left', 'right'].forEach((key) => {
            if (Reflect.has(payload, key)) {
                const value = payload[key];
                if (value === undefined) {
                    payload[key] = _api_const__WEBPACK_IMPORTED_MODULE_1__.TAG.VALUE_IS_UNDEFINED;
                }
                else if (value === null) {
                    payload[key] = _api_const__WEBPACK_IMPORTED_MODULE_1__.TAG.VALUE_IS_NULL;
                }
                else {
                    payload[key] = cloneFn(value);
                }
            }
        });
        window.postMessage({
            source: 'jsdiff-console-to-proxy',
            payload,
        }, window.location.origin);
    }
    catch (e) {
        console.error('%cconsole.diff()', `
          font-weight: 700;
          color: #000;
          background-color: #ffbbbb;
          padding: 2px 4px;
          border: 1px solid #bbb;
          border-radius: 4px;
        `, e);
    }
}
Object.assign(console, {
    /** experimental */
    diffX: (...args) => post(_api_clone__WEBPACK_IMPORTED_MODULE_0__.customClone, args.length === 1
        ? { push: args[0], timestamp: Date.now() }
        : { left: args[0], right: args[1], timestamp: Date.now() }),
    diff: (...args) => post(_api_clone__WEBPACK_IMPORTED_MODULE_0__.nativeClone, args.length === 1
        ? { push: args[0], timestamp: Date.now() }
        : { left: args[0], right: args[1], timestamp: Date.now() }),
    diffLeft: (left) => post(_api_clone__WEBPACK_IMPORTED_MODULE_0__.nativeClone, { left, timestamp: Date.now() }),
    diffRight: (right) => post(_api_clone__WEBPACK_IMPORTED_MODULE_0__.nativeClone, { right, timestamp: Date.now() }),
    diffPush: (push) => post(_api_clone__WEBPACK_IMPORTED_MODULE_0__.nativeClone, { push, timestamp: Date.now() }),
});
console.debug('%c✚ console.diff()', `
      font-weight: 700;
      color: #000;
      background-color: yellow;
      padding: 2px 4px;
      border: 1px solid #bbb;
      border-radius: 4px;
    `);

})();

/******/ })()
;
//# sourceMappingURL=jsdiff-console.js.map