let devToolsConnection;

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('Received message from content script:', msg);

  // Forward the message to the DevTools page if it's open
  if (devToolsConnection) {
    devToolsConnection.postMessage(msg);
  }
});

// Listen for connections from DevTools page
chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name === 'devtools-page');

  // Save the DevTools page connection for later use
  devToolsConnection = port;

  // Disconnect event (optional)
  port.onDisconnect.addListener(() => {
    console.log('DevTools page disconnected');
    devToolsConnection = null;
  });
});
