(()=>{"use strict";null!==chrome.devtools.inspectedWindow.tabId&&chrome.devtools.panels.create("JSDiff","/bundle/img/panel-icon28.png","/bundle/jsdiff-panel.html",(e=>{e.onSearch.addListener((async(e,s)=>{await chrome.runtime.sendMessage({source:"jsdiff-devtools-to-panel-search",params:{cmd:e,query:s}})}))}))})();