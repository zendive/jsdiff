window.addEventListener('message', (e: MessageEvent<ICompareMessage>) => {
  if (
    e.origin === window.location.origin &&
    e.source === window &&
    typeof e.data === 'object' &&
    e.data !== null &&
    e.data.source === 'jsdiff-console-to-proxy'
  ) {
    // TODO: move shifter of storage to here from the devtools
    // TODO: store to localStorage and don't pass to panel any data
    //  - just signal it, panel then would read it from localStorage
    // TODO: rundomize source messages values,
    //  so at runtime source name can't be guessed in advance
    //  use random id + namespace

    chrome.runtime.sendMessage({
      source: 'jsdiff-proxy-to-devtools',
      payload: e.data.payload,
    });
  }
});
