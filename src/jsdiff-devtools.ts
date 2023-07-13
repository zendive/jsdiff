import { define_console_api } from '@/api/console';

// tabId may be null if user opened the devtools of the devtools
if (chrome.devtools.inspectedWindow.tabId !== null) {
  chrome.devtools.panels.create(
    'JSDiff',
    '/bundle/img/panel-icon28.png',
    '/bundle/jsdiff-panel.html',
    (panel) => {
      panel.onSearch.addListener(async (cmd, query) => {
        await chrome.runtime.sendMessage({
          source: 'jsdiff-devtools-to-panel-search',
          params: { cmd, query },
        });
      });
    }
  );

  injectScripts(chrome.devtools.inspectedWindow.tabId);

  // listen on tabs page reload
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if ('complete' === changeInfo.status) {
      injectScripts(tabId);
    }
  });

  // track api invocation - (api can be invoked prior opening of jsdiff panel)
  chrome.runtime.onMessage.addListener(async (req) => {
    if ('jsdiff-proxy-to-devtools' === req.source) {
      const payload = req.payload;
      let { lastApiReq } = await chrome.storage.local.get(['lastApiReq']);
      if (!lastApiReq) {
        lastApiReq = {
          left: '(empty)',
          right: '(empty)',
          timestamp: Date.now(),
        };
      }

      if (Object.getOwnPropertyDescriptor(payload, 'push')) {
        lastApiReq.left = lastApiReq.right;
        lastApiReq.right = payload.push;
      } else {
        if (Object.getOwnPropertyDescriptor(payload, 'left')) {
          lastApiReq.left = payload.left;
        }
        if (Object.getOwnPropertyDescriptor(payload, 'right')) {
          lastApiReq.right = payload.right;
        }
      }
      lastApiReq.timestamp = payload.timestamp;

      chrome.storage.local.set({ lastApiReq: lastApiReq });
      chrome.runtime.sendMessage({
        source: 'jsdiff-devtools-to-panel-compare',
        payload: lastApiReq,
      });
    }
  });
}

// Inject console api and messaging proxy
// us shown at: https://developer.chrome.com/extensions/devtools#content-script-to-devtools
function injectScripts(tabId: number) {
  // chrome.scripting
  //   .executeScript({
  //     world: 'MAIN',
  //     target: {
  //       tabId,
  //       allFrames: true,
  //     },
  //     injectImmediately: true,
  //     files: ['/bundle/js/jsdiff-console.js'],
  //   })
  //   .then(
  //     () => {
  //       console.log('console injected in all frames');
  //       chrome.scripting
  //         .executeScript({
  //           target: {
  //             tabId,
  //             allFrames: true,
  //           },
  //           injectImmediately: true,
  //           files: ['/bundle/js/jsdiff-proxy.js'],
  //         })
  //         .then(
  //           () => {
  //             console.log('proxy injected in all frames');
  //           },
  //           (error) => {
  //             console.error('proxy inject failed', error);
  //           }
  //         );
  //     },
  //     (error) => {
  //       console.error('console inject failed', error);
  //     }
  //   );

  // chrome.devtools.inspectedWindow.eval(
  //   `;(${define_console_api.toString()})();`,
  //   {
  //     useContentScriptContext: false, // default: false
  //   },
  //   (res, error) => {
  //     if (res && !error) {
  //       chrome.scripting
  //         .executeScript({
  //           target: {
  //             tabId,
  //             allFrames: true,
  //           },
  //           injectImmediately: true,
  //           files: ['/bundle/js/jsdiff-proxy.js'],
  //         })
  //         .then(
  //           () => {
  //             console.log('proxy injected in all frames');
  //           },
  //           (error) => {
  //             console.error('proxy inject failed', error);
  //           }
  //         );
  //     }
  //   }
  // );
}
