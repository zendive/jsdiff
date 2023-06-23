(() => {
  window.addEventListener('message', (e) => {
    if (
      typeof e.data === 'object' &&
      e.data !== null &&
      e.data.source === 'jsdiff-console-to-proxy'
    ) {
      chrome.runtime.sendMessage({
        source: 'jsdiff-proxy-to-devtools',
        payload: e.data.payload,
      });
    }
  });
})();
