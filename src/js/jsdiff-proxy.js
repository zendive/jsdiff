;(function(w, x) {
  'use strict';
  w.addEventListener('message', function jsdiff_devtools_extension_proxy(e) {
    if (// message from the same frame
        e.source === w &&
        e.data && typeof(e.data) === 'object' &&
        e.data.source === 'jsdiff-devtools-extension-api'
    ) {
      x && x.sendMessage(e.data);
    }
  });
})(window, chrome.runtime);
