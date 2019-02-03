const App = require('./app/panel.vue').default;

const app = new App({el: '#app'});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  app.$emit('on-runtime-message', req, sender, sendResponse);
});
