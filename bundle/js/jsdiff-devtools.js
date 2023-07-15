/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!********************************!*\
  !*** ./src/jsdiff-devtools.ts ***!
  \********************************/

// tabId may be null if user opened the devtools of the devtools
if (chrome.devtools.inspectedWindow.tabId !== null) {
    chrome.devtools.panels.create('JSDiff', '/bundle/img/panel-icon28.png', '/bundle/jsdiff-panel.html', (panel) => {
        panel.onSearch.addListener(async (cmd, query) => {
            await chrome.runtime.sendMessage({
                source: 'jsdiff-devtools-to-panel-search',
                params: { cmd, query },
            });
        });
    });
}

/******/ })()
;
//# sourceMappingURL=jsdiff-devtools.js.map