define([
    '/src/js/api/vue.runtime.min.js',
    '/src/js/api/jsondiffpatch-full.min.js',
    '/src/js/api/jsondiffpatch-formatters.min.js',
    '/src/js/api/moment.min.js'
], function (
    Vue, jsondiffpatch, formatter, moment
) {
    return {
        Vue,
        jsondiffpatch,
        formatter,
        moment
    };
});
