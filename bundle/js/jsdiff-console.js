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
/* harmony import */ var _toolkit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./toolkit */ "./src/api/toolkit.ts");
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ObjectsCatalog_instances, _ObjectsCatalog_records, _ObjectsCatalog_instanceCounter, _ObjectsCatalog_counterToString;


async function nativeClone(value) {
    let set = new Set();
    const rv = JSON.parse(JSON.stringify(value, nativeClonePostDataAdapter.bind(null, set)));
    set = set.clear();
    return rv;
}
class ObjectsCatalog {
    constructor() {
        _ObjectsCatalog_instances.add(this);
        _ObjectsCatalog_records.set(this, void 0);
        _ObjectsCatalog_instanceCounter.set(this, 0);
        __classPrivateFieldSet(this, _ObjectsCatalog_records, new Map(), "f");
    }
    clear() {
        __classPrivateFieldGet(this, _ObjectsCatalog_records, "f").clear();
    }
    lookup(value, badge) {
        var _a;
        let record = __classPrivateFieldGet(this, _ObjectsCatalog_records, "f").get(value);
        if (!record) {
            __classPrivateFieldSet(this, _ObjectsCatalog_instanceCounter, (_a = __classPrivateFieldGet(this, _ObjectsCatalog_instanceCounter, "f"), ++_a), "f");
            const id = __classPrivateFieldGet(this, _ObjectsCatalog_instances, "m", _ObjectsCatalog_counterToString).call(this, __classPrivateFieldGet(this, _ObjectsCatalog_instanceCounter, "f"));
            record = {
                name: isSymbol(value)
                    ? badge(value.toString(), id)
                    : badge(id),
                seen: false,
            };
            __classPrivateFieldGet(this, _ObjectsCatalog_records, "f").set(value, record);
        }
        return record;
    }
}
_ObjectsCatalog_records = new WeakMap(), _ObjectsCatalog_instanceCounter = new WeakMap(), _ObjectsCatalog_instances = new WeakSet(), _ObjectsCatalog_counterToString = function _ObjectsCatalog_counterToString(counter) {
    return counter.toString(16).padStart(4, '0');
};
async function customClone(value) {
    let catalog = new ObjectsCatalog();
    const rv = await recursiveClone(catalog, value);
    catalog.clear();
    catalog = null;
    return rv;
}
async function recursiveClone(catalog, value) {
    let rv = value;
    if (isUnserializable(value)) {
        const { name } = catalog.lookup(value, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.UNSERIALIZABLE);
        rv = name;
    }
    else if (isFunction(value)) {
        rv = await serializeFunction(value);
    }
    else if (isSymbol(value)) {
        const { name } = catalog.lookup(value, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.SYMBOL);
        rv = name;
    }
    else if (isArray(value)) {
        rv = await serializeArrayAlike(catalog, value, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.RECURRING_ARRAY);
    }
    else if (isSet(value)) {
        rv = await serializeArrayAlike(catalog, value, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.RECURRING_SET);
    }
    else if (isMap(value)) {
        rv = await serializeMap(catalog, value);
    }
    else if (isObject(value)) {
        rv = await serializeObject(catalog, value);
    }
    else if (value === undefined) {
        // JsonDiffPatch has problem identifying undefined value - storing a string instead
        rv = _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.UNDEFINED;
    }
    return rv;
}
async function serializeArrayAlike(catalog, value, badge) {
    const record = catalog.lookup(value, badge);
    let rv;
    if (record.seen) {
        rv = record.name;
    }
    else {
        record.seen = true;
        const arr = [];
        for (const v of value) {
            arr.push(await recursiveClone(catalog, v));
        }
        rv = arr;
    }
    return rv;
}
async function serializeMap(catalog, value) {
    const record = catalog.lookup(value, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.RECURRING_MAP);
    let rv;
    if (record.seen) {
        rv = record.name;
    }
    else {
        record.seen = true;
        const obj = {};
        for (const [k, v] of value) {
            const newKey = await serializeMapKey(catalog, k);
            const newValue = await recursiveClone(catalog, v);
            obj[newKey] = newValue;
        }
        rv = obj;
    }
    return rv;
}
async function serializeMapKey(catalog, key) {
    let rv;
    if (isUnserializable(key)) {
        const { name } = catalog.lookup(key, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.UNSERIALIZABLE);
        rv = name;
    }
    else if (isFunction(key)) {
        rv = await serializeFunction(key);
    }
    else if (isSymbol(key)) {
        const { name } = catalog.lookup(key, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.SYMBOL);
        rv = name;
    }
    else if (isArray(key)) {
        const { name } = catalog.lookup(key, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.RECURRING_ARRAY);
        rv = name;
    }
    else if (isSet(key)) {
        const { name } = catalog.lookup(key, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.RECURRING_SET);
        rv = name;
    }
    else if (isMap(key)) {
        const { name } = catalog.lookup(key, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.RECURRING_MAP);
        rv = name;
    }
    else if (isObject(key)) {
        const { name } = catalog.lookup(key, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.RECURRING_OBJECT);
        rv = name;
    }
    else {
        rv = String(key);
    }
    return rv;
}
async function serializeObject(catalog, value) {
    const record = catalog.lookup(value, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.RECURRING_OBJECT);
    let rv;
    if (record.seen) {
        rv = record.name;
    }
    else {
        record.seen = true;
        if (isSelfSerializableObject(value)) {
            const newValue = serializeSelfSerializable(value);
            rv = await recursiveClone(catalog, newValue);
        }
        else {
            const obj = {};
            const ownKeys = Reflect.ownKeys(value);
            for (const key of ownKeys) {
                let newKey, newValue;
                if (isSymbol(key)) {
                    const { name } = catalog.lookup(key, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.SYMBOL);
                    newKey = name;
                }
                else {
                    newKey = key;
                }
                try {
                    // accessing value by key may throw
                    newValue = await recursiveClone(catalog, value[key]);
                }
                catch (error) {
                    newValue = stringifyError(error);
                }
                obj[newKey] = newValue;
            }
            rv = obj;
        }
    }
    return rv;
}
async function serializeFunction(value) {
    const fnBody = value.toString();
    if (fnBody.endsWith('{ [native code] }')) {
        return _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.NATIVE_FUNCTION;
    }
    else {
        const hash = await (0,_toolkit__WEBPACK_IMPORTED_MODULE_1__.SHA256)(fnBody);
        return _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.FUCNTION(hash);
    }
}
function serializeSelfSerializable(value) {
    let rv;
    try {
        // rogue object may throw
        rv = value.toJSON();
    }
    catch (error) {
        rv = stringifyError(error);
    }
    return rv;
}
function stringifyError(error) {
    return typeof error?.toString === 'function'
        ? _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.EXCEPTION(error.toString())
        : _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.EXCEPTION_FALLBACK;
}
function nativeClonePostDataAdapter(set, key, value) {
    try {
        if (isUnserializable(value)) {
            return undefined;
        }
        else if (isFunction(value)) {
            return value.toString();
        }
        else if (isObject(value)) {
            if (set.has(value)) {
                return undefined;
            }
            else {
                set.add(value);
            }
        }
        return value;
    }
    catch (error) {
        return stringifyError(error);
    }
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
        that instanceof BigInt64Array ||
        that instanceof Float32Array ||
        that instanceof Float64Array);
}
function isFunction(that) {
    return (typeof that === 'function' &&
        'toString' in that &&
        typeof that.toString === 'function');
}
function isSet(that) {
    return that instanceof Set;
}
function isMap(that) {
    return that instanceof Map;
}
function isSelfSerializableObject(that) {
    let rv;
    try {
        rv =
            that !== null &&
                typeof that === 'object' &&
                'toJSON' in that &&
                typeof that.toJSON === 'function';
    }
    catch (ignore) {
        rv = false;
    }
    return rv;
}
function isUnserializable(that) {
    return that instanceof Element || that instanceof Document;
}
function isSymbol(that) {
    return typeof that === 'symbol';
}
function isObject(that) {
    return (that !== null && typeof that === 'object') || that instanceof Object;
}


/***/ }),

/***/ "./src/api/const.ts":
/*!**************************!*\
  !*** ./src/api/const.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ERROR: () => (/* binding */ ERROR),
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
    UNSERIALIZABLE: (id) => `0x${id}: unserializable`,
    SYMBOL: (name, id) => `0x${id}: ${name}`,
    FUCNTION: (hash) => `𝑓(${hash})`,
};
const ERROR = {
    NO_CONNECTION: 'Could not establish connection. Receiving end does not exist.',
    PORT_CLOSED: 'The message port closed before a response was received.',
    QUOTA_EXCEEDED: 'QUOTA_BYTES quota exceeded',
};


/***/ }),

/***/ "./src/api/toolkit.ts":
/*!****************************!*\
  !*** ./src/api/toolkit.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SHA256: () => (/* binding */ SHA256),
/* harmony export */   hasValue: () => (/* binding */ hasValue)
/* harmony export */ });
function hasValue(o) {
    return undefined !== o && null !== o;
}
async function SHA256(data) {
    const textAsBuffer = new TextEncoder().encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', textAsBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const digest = hashArray
        .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
        .join('');
    return digest;
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
/*!*******************************!*\
  !*** ./src/jsdiff-console.ts ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _api_clone__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/api/clone */ "./src/api/clone.ts");
/* harmony import */ var _api_const__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/api/const */ "./src/api/const.ts");


async function post(cloneFn, payload) {
    try {
        window.postMessage({ source: 'jsdiff-console-to-proxy-inprogress', on: true }, window.location.origin);
        for (const key of ['push', 'left', 'right']) {
            if (Reflect.has(payload, key)) {
                const value = payload[key];
                if (value === undefined) {
                    payload[key] = _api_const__WEBPACK_IMPORTED_MODULE_1__.TAG.UNDEFINED;
                }
                else if (value === null) {
                    payload[key] = _api_const__WEBPACK_IMPORTED_MODULE_1__.TAG.NULL;
                }
                else {
                    payload[key] = await cloneFn(value);
                }
            }
        }
        window.postMessage({ source: 'jsdiff-console-to-proxy-compare', payload }, window.location.origin);
    }
    catch (e) {
        window.postMessage({ source: 'jsdiff-console-to-proxy-inprogress', on: false }, window.location.origin);
    }
}
Object.assign(console, {
    /** diffX experimental custom clone */
    diffX: (...args) => {
        post(_api_clone__WEBPACK_IMPORTED_MODULE_0__.customClone, args.length === 1
            ? { push: args[0], timestamp: Date.now() }
            : { left: args[0], right: args[1], timestamp: Date.now() });
    },
    diff: (...args) => {
        post(_api_clone__WEBPACK_IMPORTED_MODULE_0__.nativeClone, args.length === 1
            ? { push: args[0], timestamp: Date.now() }
            : { left: args[0], right: args[1], timestamp: Date.now() });
    },
    diffLeft: (left) => {
        post(_api_clone__WEBPACK_IMPORTED_MODULE_0__.nativeClone, { left, timestamp: Date.now() });
    },
    diffRight: (right) => {
        post(_api_clone__WEBPACK_IMPORTED_MODULE_0__.nativeClone, { right, timestamp: Date.now() });
    },
    diffPush: (push) => {
        post(_api_clone__WEBPACK_IMPORTED_MODULE_0__.nativeClone, { push, timestamp: Date.now() });
    },
});
console.debug('✚ console.diff()');

})();

/******/ })()
;
//# sourceMappingURL=jsdiff-console.js.map