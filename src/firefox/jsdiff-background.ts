// background script for Firefox

import { BACKGROUND_SCRIPT_CONNECTION_NAME } from '../api/const.ts';

const ports = new Set<browser.runtime.Port>();

// listen to requests from browser.runtime.connect
browser.runtime.onConnect.addListener((port) => {
  if (port.name !== BACKGROUND_SCRIPT_CONNECTION_NAME || ports.has(port)) {
    return;
  }

  ports.add(port);
  // console.debug('++ ports', ports.size);

  port.onDisconnect.addListener((port) => {
    ports.delete(port);
    // console.debug('-- ports', ports.size);
  });
});

browser.runtime.onMessage.addListener((msg) => {
  ports.forEach((port) => void port.postMessage(msg));
});
