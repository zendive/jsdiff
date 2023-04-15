// tabId may be null if user opened the devtools of the devtools
if (chrome.devtools.inspectedWindow.tabId !== null) {
  chrome.devtools.panels.create(
    'JSDiff',
    '/src/img/panel-icon28.png',
    '/src/jsdiff-panel.html',
    (panel) => {
      panel.onSearch.addListener(async (cmd, query) => {
        await chrome.runtime.sendMessage({
          source: 'jsdiff-panel-search',
          params: { cmd, query },
        });
      });
    }
  );

  injectScripts();

  // listen on tabs page reload
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if ('complete' === changeInfo.status) {
      injectScripts();
    }
  });

  // track api invocation - (api can be invoked prior opening of jsdiff panel)
  chrome.runtime.onMessage.addListener(async (req) => {
    if ('jsdiff-devtools-extension-api' === req.source) {
      await chrome.storage.local.set({ lastApiReq: req });
    }
  });
}

// Inject console api and messaging proxy
// us shown at: https://developer.chrome.com/extensions/devtools#content-script-to-devtools
function injectScripts() {
  chrome.devtools.inspectedWindow.eval(
    `;(${jsdiff_devtools_extension_api.toString()})();`,
    {
      useContentScriptContext: false, // default: false
    },
    (res, error) => {
      if (res && !error) {
        const tabId = chrome.devtools.inspectedWindow.tabId;

        chrome.scripting
          .executeScript({
            target: {
              tabId,
              allFrames: true,
            },
            files: ['/src/js/jsdiff-proxy.js'],
          })
          .then(
            () => {
              // console.log('script injected in all frames');
            },
            (error) => {
              // console.error('script inject failed', error);
            }
          );
      }
    }
  );
}

function jsdiff_devtools_extension_api() {
  if (typeof console.diff === 'function') {
    /* already injected */
    return false;
  }

  function postDataAdapter(set, key, value) {
    try {
      if (value instanceof Element || value instanceof Document) {
        return undefined;
      } else if (typeof value === 'function') {
        return value.toString();
      } else if (value instanceof Object || typeof value === 'object') {
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
            JSON.stringify(payload[key], postDataAdapter.bind(null, set))
          );
          set.clear();
          set = null;
        }
      });

      window.postMessage(
        {
          payload,
          source: 'jsdiff-devtools-extension-api',
        },
        '*'
      );
    } catch (e) {
      console.error(
        '%cconsole.diff',
        `
        font-weight: 700;
        color: #000;
        background-color: #ffbbbb;
        padding: 2px 4px;
        border: 1px solid #bbb;
        border-radius: 4px;
      `,
        e
      );
    }
  }

  Object.assign(console, {
    diff: (left, right) =>
      post(
        right === undefined
          ? { push: left, timestamp: Date.now() }
          : { left, right, timestamp: Date.now() }
      ),
    diffLeft: (left) => post({ left, timestamp: Date.now() }),
    diffRight: (right) => post({ right, timestamp: Date.now() }),
    diffPush: (push) => post({ push, timestamp: Date.now() }),
  });

  console.debug(
    '%c✚ console.diff',
    `
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
