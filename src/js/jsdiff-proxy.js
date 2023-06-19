(() => {
  window.addEventListener('message', (e) => {
    if (
      typeof e.data === 'object' &&
      e.data.source === 'jsdiff-devtools-extension-api'
    ) {
      chrome.runtime.sendMessage(e.data);
    }
  });
})();
