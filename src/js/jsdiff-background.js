console.log('jsdiff-background loaded');

const connections = new Map();
let lastApiReq = null;

chrome.runtime.onConnect.addListener((port) => {
  console.log('jsdiff-background connected with, port:', port);

  const devToolsListener = (message, sender, sendResponse) => {
    if (message.name === 'init') {
      const connection = new Connection(port);
      connections.set(message.tabId, connection);
      console.log('jsdiff-background initialized, message:', message);
    }
  };

  port.onMessage.addListener(devToolsListener);
  port.onDisconnect.addListener((port) => {
    port.onMessage.removeListener(devToolsListener);

    for (let [tabId, con] of connections) {
      if (port === con.port) {
        con.onDisconnect();
        connections.delete(tabId);
        break;
      }
    }
  });
});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  const tabId = sender.tab && sender.tab.id;

  if (
    'jsdiff-devtools-extension-api' === req.source &&
    connections.has(tabId)
  ) {
    lastApiReq = req;
    connections.get(tabId).onApiMessage(req);
  } else if ('jsdiff-devtools-panel-shown' === req.type) {
    // message from one of devtool panels
    sendResponse(lastApiReq);
  }

  return '!!magic';
});

class Connection {
  constructor(port) {
    this.port = port;
  }

  /**
   * from content-script jsdiff-proxy.js
   * relay to jsdiff-panel.js
   */
  onApiMessage(req) {
    console.log('jsdiff-background message relay', req);
    if (this.port !== null) {
      this.port.postMessage(req);
    }
  }

  onDisconnect() {
    this.port = null;
  }
}
