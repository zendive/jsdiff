define([
  'js/api/vue.runtime.min',
  'js/api/jsondiffpatch.umd',
  'js/api/moment.min'
], function(
    Vue, jsondiffpatch, formatter, moment
) {
  return {
    Vue,
    jsondiffpatch,
    formatters: jsondiffpatch.formatters,
    moment
  };
});
