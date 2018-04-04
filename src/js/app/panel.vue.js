define([
    'vue',
    'jsondiffpatch',
    'formatter'
], function (Vue, jsondiffpatch, formatter) {
    'use strict';
    // language=Vue
    return Vue.extend({
        name: 'app',

        render(ce) {
            return ce('div', {}, [
                ce('h1', {}, 'JSDiff'),
                this.compare.timestamp,
                ce('div', [
                    ce('button', {
                        on: {click: this.onToggleUnchanged}
                    }, 'Toggle Unchanged')
                ]),
                ce('div', {
                    domProps: {innerHTML: this.deltaHtml}
                })
            ]);
        },

        data() {
            return {
                showUnchanged: true,
                compare: {
                    timestamp: null,
                    left: {},
                    right: {}
                }
            };
        },

        mounted() {
            this.$on('on-runtime-message', this.$_onRuntimeMessage);
        },

        computed: {
            deltaHtml() {
                try {
                    return formatter.html.format(
                        jsondiffpatch.diff(this.compare.left, this.compare.right),
                        this.compare.left
                    );
                }
                catch (bug) {
                    return JSON.stringify(bug);
                }
            }
        },

        methods: {
            $_onRuntimeMessage(req, sender, sendResponse) {
                console.log('$_onRuntimeMessage', req);

                if (req.source === 'jsdiff-devtools-extension-api') {
                    this.$_onDiffRequest(req.payload.left, req.payload.right);
                }
            },

            $_onDiffRequest(left, right) {
                if (left && typeof(left) === 'object') {
                    this.compare.left = left;
                }
                if (right && typeof(right) === 'object') {
                    this.compare.right = right;
                }

                this.compare.timestamp = Date.now();
            },

            onToggleUnchanged(e) {
                this.showUnchanged = !this.showUnchanged;
                formatter.html.showUnchanged(this.showUnchanged, document.body);
            }
        }

    });
});
