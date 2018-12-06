require.config({
  waitSeconds: 30,
  baseUrl: '/src',
  paths: {
    api: 'js/api/api'
  },
  shim: {}
});

require([
  'js/app/panel.vue'
], function(App) {
  'use strict';
  const app = new App({el: '#app'});
  chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    app.$emit('on-runtime-message', req, sender, sendResponse);
  });
});
