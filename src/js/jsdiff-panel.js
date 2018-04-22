require.config({
  waitSeconds: 30,
  paths: {
    api: '/src/js/api/api'
  },
  shim: {}
});

require([
  '/src/js/app/panel.vue.js'
], function(App) {
  'use strict';
  const app = new App({el: '#app'});
  chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    app.$emit('on-runtime-message', req, sender, sendResponse);
  });
});
