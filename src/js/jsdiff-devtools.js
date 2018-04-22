// resistance is futile

// Create panel
chrome.devtools.panels.create(
    'JSDiff',
    '/src/img/panel-icon16.png',
    '/src/jsdiff-panel.html',
    (panel) => {
        panel.onSearch.addListener(sendMessage('jsdiff-panel-search'));
        panel.onShown.addListener(sendMessage('jsdiff-panel-shown'));
        panel.onHidden.addListener(sendMessage('jsdiff-panel-hidden'));
    }
);

// Create a connection to the background page
if (chrome.devtools.inspectedWindow.tabId !== null) {
    // tabId may be null if user opened devtools-of-devtools etc.
    const backgroundPageConnection = chrome.runtime.connect({name: 'jsdiff-devtools'});
    backgroundPageConnection.postMessage({
        name: 'init',
        tabId: chrome.devtools.inspectedWindow.tabId
    });

    injectScripts();
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req === 'jsdiff-panel-reinject') {
        injectScripts();
    }
});

// Inject console api and messaging proxy
// us shown at: https://developer.chrome.com/extensions/devtools#content-script-to-devtools
function injectScripts () {
    chrome.devtools.inspectedWindow.eval(
        ';('+jsdiff_devtools_extension_api.toString()+')()', {
            useContentScriptContext: false // default: false
        }, (res, error) => {
            //...
        });

    chrome.tabs.executeScript(chrome.devtools.inspectedWindow.tabId, {
        file: '/src/js/jsdiff-proxy.js'
    });
}

function jsdiff_devtools_extension_api () {
    if (console.diff) {return;/*nothing to do*/}
    const source = 'jsdiff-devtools-extension-api';
    const w = window;

    Object.assign(console, {
        diff(left, right) {w.postMessage({payload: {left, right}, source}, '*');},
        diffLeft(left) {w.postMessage({payload: {left}, source}, '*');},
        diffRight(right) {w.postMessage({payload: {right}, source}, '*');},
        diffPush(push) {w.postMessage({payload: {push}, source}, '*');}
    });

    console.log(
        '%cJSDiff API', `
            font-weight: 700;
            color: #000;
            background-color: yellow;
            padding: 2px 4px;
            border: 1px solid #bbb;
            border-radius: 4px;
        `,
        `console.diff(left, right); console.diffLeft(left); console.diffRight(right); console.diffPush(next);`
    );
}

function sendMessage (message) {
    return function () {
        chrome.runtime.sendMessage(message);
    };
}
