// resistance is futile

// Create panel
chrome.devtools.panels.create(
    'JSDiff',
    '/src/img/panel-icon28.png',
    '/src/jsdiff-panel.html',
    (panel) => {
      //panel.onSearch.addListener(sendMessage('jsdiff-panel-search'));
      //panel.onShown.addListener(sendMessage('jsdiff-panel-shown'));
      //panel.onHidden.addListener(sendMessage('jsdiff-panel-hidden'));
    }
);

// Create a connection to the background page
if (chrome.devtools.inspectedWindow.tabId !== null) {
  // tabId may be null if user opened the devtools of the devtools
  const backgroundPageConnection = chrome.runtime.connect({name: 'jsdiff-devtools'});
  backgroundPageConnection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
  });

  injectScripts();
}

// listen on tabs page reload
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if ('complete' === changeInfo.status) {
    injectScripts();
  }
});

// Inject console api and messaging proxy
// us shown at: https://developer.chrome.com/extensions/devtools#content-script-to-devtools
function injectScripts() {
  chrome.devtools.inspectedWindow.eval(
      `;(${jsdiff_devtools_extension_api.toString()})();`, {
        useContentScriptContext: false // default: false
      }, (res, error) => {
        if (res && !error) {
          // injected
          chrome.tabs.executeScript(chrome.devtools.inspectedWindow.tabId, {
            file: '/src/js/jsdiff-proxy.js'
          });
        }
      });
}

function jsdiff_devtools_extension_api() {
  if (typeof(console.diff) === 'function') {
    /*already injected*/
    return false;
  }

  function postDataAdapter(set, key, value) {
    try {
      if (
        value instanceof Element ||
        value instanceof Document
      ) {
        return undefined;
      } else if (typeof(value) === 'function') {
        return value.toString();
      } else if (
        value instanceof Object ||
        typeof(value) === 'object'
      ) {
        if (set.has(value)) {
          return undefined;
        }
        set.add(value);
      }

      return value;
    } catch (ignore) {
      return undefined;
    }
  }

  function post(payload) {
    try {
      ['push', 'left', 'right'].forEach((key) => {
        if (payload.hasOwnProperty(key)) {
          let set = new Set();
          payload[key] = JSON.parse(
            JSON.stringify(
              payload[key],
              postDataAdapter.bind(null, set)
            )
          );
          set.clear();
          set = null;
        }
      });
      window.postMessage({payload, source: 'jsdiff-devtools-extension-api'}, '*');
    } catch (e) {
      console.error('%cJSDiff', `
        font-weight: 700;
        color: #000;
        background-color: yellow;
        padding: 2px 4px;
        border: 1px solid #bbb;
        border-radius: 4px;
      `, e);
    }
  }

  Object.assign(console, {
    diff(left, right) {
      post(right === undefined? {push: left} : {left, right});
    },

    diffLeft(left) {
      post({left});
    },

    diffRight(right) {
      post({right});
    },

    diffPush(push) {
      post({push});
    },
  });

  console.log(
    '%c✚ console.diff(left, right);', `
      font-weight: 700;
      color: #000;
      background-color: yellow;
      padding: 2px 4px;
      border: 1px solid #bbb;
      border-radius: 4px;
    `
  );

  return true;
}

function sendMessage(message) {
  return function() {
    chrome.runtime.sendMessage(message);
  };
}
