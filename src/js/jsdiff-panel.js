require.config({
    waitSeconds: 30,
    paths: {
        vue: '/src/js/lib/vue.runtime',
        jsondiffpatch: '/src/js/lib/jsondiffpatch-full.min',
        formatter: '/src/js/lib/jsondiffpatch-formatters.min'
    },
    shim: {}
});

require([
    '/src/js/app/panel.vue.js'
], function (App) {
    'use strict';
    const app = new App({el: '#app'});
    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
        app.$emit('on-runtime-message', req, sender, sendResponse);
    });
});
