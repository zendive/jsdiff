const jsondiffpatch = require('jsondiffpatch');
const moment = require('moment');
const Vue = require('vue');

module.exports = {
  Vue: Vue.default,
  jsondiffpatch,
  formatters: jsondiffpatch.formatters,
  moment
};
