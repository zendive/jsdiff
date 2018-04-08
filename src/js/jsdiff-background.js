const connections = {};

chrome.runtime.onConnect.addListener((port/*devToolsConnection*/) => {
    console.log('jsdiff-background connected with', port.name);

    const devToolsListener = (message, sender, sendResponse) => {
        if (message.name === 'init') {
            connections[message.tabId] = port;
            console.log('jsdiff-background initialized', port.name, message);
        }
    };
    port.onMessage.addListener(devToolsListener);
    port.onDisconnect.addListener(() => {
        port.onMessage.removeListener(devToolsListener);

        const tabs = Object.keys(connections);
        for (let i = 0, I = tabs.length; i < I; i++) {
            if (connections[tabs[i]] === port) {
                delete connections[tabs[i]];
                break;
            }
        }
    });
});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (sender.tab) {
        // from content-script jsdiff-proxy.js
        const tabId = sender.tab.id;
        if (tabId in connections) {
            // relay to jsdiff-panel.js
            connections[tabId].postMessage(req);
            console.log('jsdiff-background message relay', req);
        }
    }
    else {
        // from elsewhere
    }

    return !!'magic';
});

console.log('jsdiff-background loaded');
