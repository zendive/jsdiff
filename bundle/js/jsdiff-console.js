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
/* harmony export */   nativeClone: () => (/* binding */ nativeClone),
/* harmony export */   post: () => (/* binding */ post)
/* harmony export */ });
/* harmony import */ var _api_const__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/api/const */ "./src/api/const.ts");
/* harmony import */ var _api_toolkit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/api/toolkit */ "./src/api/toolkit.ts");



class ObjectsCatalog {
  #records;
  #instanceCounter = 0;
  constructor() {
    this.#records = /* @__PURE__ */ new Map();
  }
  clear() {
    this.#records.clear();
  }
  #counterToString(counter) {
    return counter.toString(16).padStart(4, "0");
  }
  lookup(value, badge) {
    let record = this.#records.get(value);
    if (!record) {
      ++this.#instanceCounter;
      const id = this.#counterToString(this.#instanceCounter);
      record = {
        name: isSymbol(value) ? badge(value.toString(), id) : badge(id),
        seen: false
      };
      this.#records.set(value, record);
    }
    return record;
  }
}
async function post(cloneFn, payload) {
  try {
    window.postMessage(
      { source: "jsdiff-console-to-proxy-inprogress", on: true },
      "*"
    );
    for (const key of ["push", "left", "right"]) {
      if (Reflect.has(payload, key)) {
        const value = payload[key];
        if (value === void 0) {
          payload[key] = _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.UNDEFINED;
        } else if (value === null) {
          payload[key] = _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.NULL;
        } else {
          payload[key] = await cloneFn(value);
        }
      }
    }
    window.postMessage(
      { source: "jsdiff-console-to-proxy-compare", payload },
      "*"
    );
  } catch (error) {
    console.error("console.diff()", error);
    window.postMessage(
      { source: "jsdiff-console-to-proxy-inprogress", on: false },
      "*"
    );
  }
}
async function nativeClone(value) {
  let set = /* @__PURE__ */ new Set();
  const rv = JSON.parse(
    JSON.stringify(value, nativeClonePostDataAdapter.bind(null, set))
  );
  set.clear();
  set = null;
  return rv;
}
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
  } else if (isFunction(value)) {
    rv = await serializeFunction(value);
  } else if (isSymbol(value)) {
    const { name } = catalog.lookup(value, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.SYMBOL);
    rv = name;
  } else if (isArray(value)) {
    rv = await serializeArrayAlike(catalog, value, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.RECURRING_ARRAY);
  } else if (isSet(value)) {
    rv = await serializeArrayAlike(catalog, value, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.RECURRING_SET);
  } else if (isMap(value)) {
    rv = await serializeMap(catalog, value);
  } else if (isObject(value)) {
    rv = await serializeObject(catalog, value);
  } else if (isNumericSpecials(value)) {
    rv = _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.NUMERIC(value);
  } else if (value === void 0) {
    rv = _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.UNDEFINED;
  }
  return rv;
}
function isNumericSpecials(value) {
  return typeof value === "bigint" || Number.isNaN(value) || value === -Infinity || value === Infinity;
}
async function serializeArrayAlike(catalog, value, badge) {
  const record = catalog.lookup(value, badge);
  let rv;
  if (record.seen) {
    rv = record.name;
  } else {
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
  } else {
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
  } else if (isFunction(key)) {
    rv = await serializeFunction(key);
  } else if (isSymbol(key)) {
    const { name } = catalog.lookup(key, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.SYMBOL);
    rv = name;
  } else if (isArray(key)) {
    const { name } = catalog.lookup(key, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.RECURRING_ARRAY);
    rv = name;
  } else if (isSet(key)) {
    const { name } = catalog.lookup(key, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.RECURRING_SET);
    rv = name;
  } else if (isMap(key)) {
    const { name } = catalog.lookup(key, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.RECURRING_MAP);
    rv = name;
  } else if (isObject(key)) {
    const { name } = catalog.lookup(key, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.RECURRING_OBJECT);
    rv = name;
  } else if (isNumericSpecials(key)) {
    rv = _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.NUMERIC(key);
  } else if (key === void 0) {
    rv = _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.UNDEFINED;
  } else {
    rv = String(key);
  }
  return rv;
}
async function serializeObject(catalog, value) {
  const record = catalog.lookup(value, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.RECURRING_OBJECT);
  let rv;
  if (record.seen) {
    rv = record.name;
  } else {
    record.seen = true;
    if (isSelfSerializableObject(value)) {
      const newValue = serializeSelfSerializable(value);
      rv = await recursiveClone(catalog, newValue);
    } else {
      const obj = {};
      const ownKeys = Reflect.ownKeys(value);
      for (const key of ownKeys) {
        let newKey, newValue;
        if (isSymbol(key)) {
          const { name } = catalog.lookup(key, _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.SYMBOL);
          newKey = name;
        } else {
          newKey = key;
        }
        try {
          newValue = await recursiveClone(catalog, value[key]);
        } catch (error) {
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
  if (fnBody.endsWith("{ [native code] }")) {
    return _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.NATIVE_FUNCTION;
  } else {
    const hash = await (0,_api_toolkit__WEBPACK_IMPORTED_MODULE_1__.SHA256)(fnBody);
    return _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.FUNCTION(value.name, hash);
  }
}
function serializeSelfSerializable(value) {
  let rv;
  try {
    rv = value.toJSON();
  } catch (error) {
    rv = stringifyError(error);
  }
  return rv;
}
function stringifyError(error) {
  return typeof error?.toString === "function" ? _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.EXCEPTION(error.toString()) : _api_const__WEBPACK_IMPORTED_MODULE_0__.TAG.EXCEPTION_FALLBACK;
}
function nativeClonePostDataAdapter(set, key, value) {
  try {
    if (isUnserializable(value)) {
      return void 0;
    } else if (isFunction(value)) {
      return value.toString();
    } else if (isObject(value)) {
      if (set.has(value)) {
        return void 0;
      } else {
        set.add(value);
      }
    }
    return value;
  } catch (error) {
    return stringifyError(error);
  }
}
function isArray(that) {
  return that instanceof Array || that instanceof Uint8Array || that instanceof Uint8ClampedArray || that instanceof Uint16Array || that instanceof Uint32Array || that instanceof BigUint64Array || that instanceof Int8Array || that instanceof Int16Array || that instanceof Int32Array || that instanceof BigInt64Array || that instanceof Float32Array || that instanceof Float64Array;
}
function isFunction(that) {
  return typeof that === "function" && "toString" in that && typeof that.toString === "function";
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
    rv = that !== null && typeof that === "object" && "toJSON" in that && typeof that.toJSON === "function";
  } catch (ignore) {
    rv = false;
  }
  return rv;
}
function isUnserializable(that) {
  return that instanceof Element || that instanceof Document;
}
function isSymbol(that) {
  return typeof that === "symbol";
}
function isObject(that) {
  return that !== null && typeof that === "object" || that instanceof Object;
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
  EMPTY: "\u27EAempty\u27EB",
  UNDEFINED: "\u27EAundefined\u27EB",
  NULL: "\u27EAnull\u27EB",
  NATIVE_FUNCTION: "\u0192\u27EAnative\u27EB",
  EXCEPTION_FALLBACK: "\u2049\uFE0F \u27EAexception\u27EB",
  EXCEPTION: (str) => `\u2049\uFE0F \u27EA${str}\u27EB`,
  RECURRING_ARRAY: (id) => `0x${id}: [\u267B\uFE0F]`,
  RECURRING_OBJECT: (id) => `0x${id}: {\u267B\uFE0F}`,
  RECURRING_SET: (id) => `0x${id}: Set[\u267B\uFE0F]`,
  RECURRING_MAP: (id) => `0x${id}: Map{\u267B\uFE0F}`,
  UNSERIALIZABLE: (id) => `0x${id}: \u27EAunserializable\u27EB`,
  SYMBOL: (name, id) => `0x${id}: ${name}`,
  FUNCTION: (name, hash) => `\u0192${name ? ` ${name}` : ""}\u27EA${hash}\u27EB`,
  NUMERIC: (value) => typeof value === "bigint" ? `BigInt\u27EA${value}\u27EB` : `Number\u27EA${value}\u27EB`
};
const ERROR = {
  NO_CONNECTION: "Could not establish connection. Receiving end does not exist.",
  PORT_CLOSED: "The message port closed before a response was received.",
  QUOTA_EXCEEDED: "QUOTA_BYTES quota exceeded"
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
  return void 0 !== o && null !== o;
}
async function SHA256(data) {
  const textAsBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", textAsBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const digest = hashArray.map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join("");
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


const consoleAPI = {
  diff: (...args) => {
    (0,_api_clone__WEBPACK_IMPORTED_MODULE_0__.post)(
      _api_clone__WEBPACK_IMPORTED_MODULE_0__.customClone,
      args.length === 1 ? { push: args[0], timestamp: Date.now() } : { left: args[0], right: args[1], timestamp: Date.now() }
    );
  },
  diffLeft: (left) => {
    (0,_api_clone__WEBPACK_IMPORTED_MODULE_0__.post)(_api_clone__WEBPACK_IMPORTED_MODULE_0__.customClone, { left, timestamp: Date.now() });
  },
  diffRight: (right) => {
    (0,_api_clone__WEBPACK_IMPORTED_MODULE_0__.post)(_api_clone__WEBPACK_IMPORTED_MODULE_0__.customClone, { right, timestamp: Date.now() });
  },
  diffPush: (push) => {
    (0,_api_clone__WEBPACK_IMPORTED_MODULE_0__.post)(_api_clone__WEBPACK_IMPORTED_MODULE_0__.customClone, { push, timestamp: Date.now() });
  },
  /** @deprecated uses JSON.parse(JSON.stringify(...))*/
  diff_: (...args) => {
    (0,_api_clone__WEBPACK_IMPORTED_MODULE_0__.post)(
      _api_clone__WEBPACK_IMPORTED_MODULE_0__.nativeClone,
      args.length === 1 ? { push: args[0], timestamp: Date.now() } : { left: args[0], right: args[1], timestamp: Date.now() }
    );
  }
};
if (typeof browser === "undefined") {
  Object.assign(console, consoleAPI);
  console.debug(`\u271A console.diff()`);
} else if (typeof cloneInto === "function") {
  window.wrappedJSObject.jsdiff = cloneInto(consoleAPI, window, {
    cloneFunctions: true
  });
  console.debug(`\u271A jsdiff.diff()`);
}

})();

/******/ })()
;
//# sourceMappingURL=jsdiff-console.js.map