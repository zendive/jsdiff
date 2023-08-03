(()=>{"use strict";var g={};const o={EMPTY:"\u27EAempty\u27EB",UNDEFINED:"\u27EAundefined\u27EB",NULL:"\u27EAnull\u27EB",NATIVE_FUNCTION:"\u0192\u27EAnative\u27EB",EXCEPTION_FALLBACK:"\u2049\uFE0F \u27EAexception\u27EB",EXCEPTION:n=>`\u2049\uFE0F \u27EA${n}\u27EB`,RECURRING_ARRAY:n=>`0x${n}: [\u267B\uFE0F]`,RECURRING_OBJECT:n=>`0x${n}: {\u267B\uFE0F}`,RECURRING_SET:n=>`0x${n}: Set[\u267B\uFE0F]`,RECURRING_MAP:n=>`0x${n}: Map{\u267B\uFE0F}`,UNSERIALIZABLE:n=>`0x${n}: \u27EAunserializable\u27EB`,SYMBOL:(n,e)=>`0x${e}: ${n}`,FUNCTION:(n,e)=>`\u0192${n?` ${n}`:""}\u27EA${e}\u27EB`,NUMERIC:n=>typeof n=="bigint"?`BigInt\u27EA${n}\u27EB`:`Number\u27EA${n}\u27EB`},x={NO_CONNECTION:"Could not establish connection. Receiving end does not exist.",PORT_CLOSED:"The message port closed before a response was received.",QUOTA_EXCEEDED:"QUOTA_BYTES quota exceeded"};function j(n){return n!=null}async function O(n){const e=new TextEncoder().encode(n),t=await crypto.subtle.digest("SHA-256",e);return Array.from(new Uint8Array(t)).map(s=>s.toString(16).padStart(2,"0").toUpperCase()).join("")}class T{#n;#e=0;constructor(){this.#n=new Map}clear(){this.#n.clear()}#t(e){return e.toString(16).padStart(4,"0")}lookup(e,t){let i=this.#n.get(e);if(!i){++this.#e;const r=this.#t(this.#e);i={name:E(e)?t(e.toString(),r):t(r),seen:!1},this.#n.set(e,i)}return i}}async function c(n,e){try{window.postMessage({source:"jsdiff-console-to-proxy-inprogress",on:!0},"*");for(const t of["push","left","right"])if(Reflect.has(e,t)){const i=e[t];i===void 0?e[t]=o.UNDEFINED:i===null?e[t]=o.NULL:e[t]=await n(i)}window.postMessage({source:"jsdiff-console-to-proxy-compare",payload:e},"*")}catch(t){console.error("console.diff()",t),window.postMessage({source:"jsdiff-console-to-proxy-inprogress",on:!1},"*")}}async function _(n){let e=new Set;const t=JSON.parse(JSON.stringify(n,B.bind(null,e)));return e.clear(),e=null,t}async function p(n){let e=new T;const t=await u(e,n);return e.clear(),e=null,t}async function u(n,e){let t=e;if(d(e)){const{name:i}=n.lookup(e,o.UNSERIALIZABLE);t=i}else if(R(e))t=await m(e);else if(E(e)){const{name:i}=n.lookup(e,o.SYMBOL);t=i}else C(e)?t=await S(n,e,o.RECURRING_ARRAY):y(e)?t=await S(n,e,o.RECURRING_SET):U(e)?t=await b(n,e):A(e)?t=await L(n,e):w(e)?t=o.NUMERIC(e):e===void 0&&(t=o.UNDEFINED);return t}function w(n){return typeof n=="bigint"||Number.isNaN(n)||n===-1/0||n===1/0}async function S(n,e,t){const i=n.lookup(e,t);let r;if(i.seen)r=i.name;else{i.seen=!0;const s=[];for(const f of e)s.push(await u(n,f));r=s}return r}async function b(n,e){const t=n.lookup(e,o.RECURRING_MAP);let i;if(t.seen)i=t.name;else{t.seen=!0;const r={};for(const[s,f]of e){const a=await D(n,s),l=await u(n,f);r[a]=l}i=r}return i}async function D(n,e){let t;if(d(e)){const{name:i}=n.lookup(e,o.UNSERIALIZABLE);t=i}else if(R(e))t=await m(e);else if(E(e)){const{name:i}=n.lookup(e,o.SYMBOL);t=i}else if(C(e)){const{name:i}=n.lookup(e,o.RECURRING_ARRAY);t=i}else if(y(e)){const{name:i}=n.lookup(e,o.RECURRING_SET);t=i}else if(U(e)){const{name:i}=n.lookup(e,o.RECURRING_MAP);t=i}else if(A(e)){const{name:i}=n.lookup(e,o.RECURRING_OBJECT);t=i}else w(e)?t=o.NUMERIC(e):e===void 0?t=o.UNDEFINED:t=String(e);return t}async function L(n,e){const t=n.lookup(e,o.RECURRING_OBJECT);let i;if(t.seen)i=t.name;else if(t.seen=!0,h(e)){const r=M(e);i=await u(n,r)}else{const r={},s=Reflect.ownKeys(e);for(const f of s){let a,l;if(E(f)){const{name:I}=n.lookup(f,o.SYMBOL);a=I}else a=f;try{l=await u(n,e[f])}catch(I){l=N(I)}r[a]=l}i=r}return i}async function m(n){const e=n.toString();if(e.endsWith("{ [native code] }"))return o.NATIVE_FUNCTION;{const t=await O(e);return o.FUNCTION(n.name,t)}}function M(n){let e;try{e=n.toJSON()}catch(t){e=N(t)}return e}function N(n){return typeof n?.toString=="function"?o.EXCEPTION(n.toString()):o.EXCEPTION_FALLBACK}function B(n,e,t){try{if(d(t))return;if(R(t))return t.toString();if(A(t)){if(n.has(t))return;n.add(t)}return t}catch(i){return N(i)}}function C(n){return n instanceof Array||n instanceof Uint8Array||n instanceof Uint8ClampedArray||n instanceof Uint16Array||n instanceof Uint32Array||n instanceof BigUint64Array||n instanceof Int8Array||n instanceof Int16Array||n instanceof Int32Array||n instanceof BigInt64Array||n instanceof Float32Array||n instanceof Float64Array}function R(n){return typeof n=="function"&&"toString"in n&&typeof n.toString=="function"}function y(n){return n instanceof Set}function U(n){return n instanceof Map}function h(n){let e;try{e=n!==null&&typeof n=="object"&&"toJSON"in n&&typeof n.toJSON=="function"}catch{e=!1}return e}function d(n){return n instanceof Element||n instanceof Document}function E(n){return typeof n=="symbol"}function A(n){return n!==null&&typeof n=="object"||n instanceof Object}Object.assign(console,{diff:(...n)=>{c(p,n.length===1?{push:n[0],timestamp:Date.now()}:{left:n[0],right:n[1],timestamp:Date.now()})},diffLeft:n=>{c(p,{left:n,timestamp:Date.now()})},diffRight:n=>{c(p,{right:n,timestamp:Date.now()})},diffPush:n=>{c(p,{push:n,timestamp:Date.now()})},diff_:(...n)=>{c(_,n.length===1?{push:n[0],timestamp:Date.now()}:{left:n[0],right:n[1],timestamp:Date.now()})}}),console.debug("\u271A console.diff()")})();
