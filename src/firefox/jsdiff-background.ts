// background script for firefox's partial(?) MV3 implementation

import { BACKGROUND_SCRIPT_CONNECTION_NAME } from '../api/const.ts';

const ports = new Map<number, browser.runtime.Port>();

// Listen for connections from DevTools pages
browser.runtime.onConnect.addListener((port) => {
  if (port.name === BACKGROUND_SCRIPT_CONNECTION_NAME) {
    const contextId = port.sender && 'contextId' in port.sender
      ? (port.sender.contextId as number)
      : -1;
    console.assert(contextId !== -1, 'unreliable port.sender.contextId');

    if (!ports.has(contextId)) {
      ports.set(contextId, port);
      console.log('++ added port', contextId, 'total', ports.size);
    }

    port.onDisconnect.addListener(() => {
      ports.delete(contextId);
      console.log('-- port removed', contextId);
    });
  }
});

// Listen for messages from content scripts
// and forward the message to the DevTools page connected ports
browser.runtime.onMessage.addListener((msg) => {
  for (const [_contextId, port] of ports) {
    port.postMessage(msg);
  }
});
