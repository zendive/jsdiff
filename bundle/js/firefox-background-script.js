(()=>{"use strict";var t={};let n=new Set;chrome.runtime.onConnect.addListener(e=>{e.name==="jsdiff-devtools-page-connect"&&(n.add(e),e.onDisconnect.addListener(()=>{n.delete(e)}))}),chrome.runtime.onMessage.addListener(e=>{for(const s of n)s.postMessage(e)})})();
