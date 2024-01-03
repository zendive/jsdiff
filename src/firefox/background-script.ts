// background script for firefox partial(?) MV3 implementation

let ports = new Set<chrome.runtime.Port>();

// Listen for connections from DevTools pages
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'jsdiff-devtools-page-connect') {
    ports.add(port);

    port.onDisconnect.addListener(() => {
      ports.delete(port);
    });
  }
});

// Listen for messages from content scripts
// and forward the message to the DevTools page connected ports
chrome.runtime.onMessage.addListener((msg) => {
  for (const port of ports) {
    port.postMessage(msg);
  }
});
