// tabId may be null if user opened the devtools of the devtools
if (chrome.devtools.inspectedWindow.tabId !== null) {
  chrome.devtools.panels.create(
    'JSDiff',
    '/bundle/img/panel-icon28.png',
    '/bundle/jsdiff-panel.html',
    (/*panel*/) => {}
  );
}
