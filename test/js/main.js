require.config({
    baseUrl: '../',
    waitSeconds: 30,
    paths: {},
    shim: {}
});

require([
    'test/js/vue.min',
    'jsdiff'
], function (Vue, jsdiff) {
    "use strict";

    // language=Vue
    new Vue({
        el: '#root',
        template: `
<div>
    <div is="row"
        v-for="(test, i) in testCase"
        :key="i"
        :test="test"
    ></div>
</div>
`,
        data() {
            var l1 = {
                a: 'A',
                b: [100, 200, 300],
                c: {
                    ca: 'Latin',
                    cb: [101, 202, 303]
                },
                d: /abcd/
            };
            var r1 = {
                a: 'A',
                b: [100, 200, 300],
                c: {
                    ca: 'עברית',
                    cb: [101, 202, 303, 404],
                    '0_o': {ff: 'ff'}
                },
                d: /abcd/i
            };

            var l2 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In lorem mi, rutrum quis suscipit eu, blandit malesuada magna. Interdum et malesuada fames ac ante ipsum primis in faucibus.';
            var r2 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In lorem mi, rutrum quis suscipit eu, blandit malesuada manna. Interdum et malesuada fames ac ante ipsum primis in faucibus.';

            var l3 = [l1, l2];
            var r3 = [r1, r2];

            return {
                testCase: [
                    {left: l1, right: r1},
                    {left: l2, right: r2},
                    {left: l3, right: r3}
                ]
            };
        },

        components: {
            row: {
                props: {
                    test: {type: Object}
                },
                template: `
<div>
    <hr/>
    Delta: <div><code>{{delta}}</code></div>
    HTML: <div v-html="html"></div>
    <button @click="popup">Invoke popup...</button>
</div>`,
                computed: {
                    delta() {return jsdiff.delta(this.test.left, this.test.right);},
                    html() {return jsdiff.html(this.test.left, this.test.right);}
                },
                methods: {
                    popup() {
                        jsdiff.show(this.test.left, this.test.right);
                    }
                }
            }
        }
    });
});
