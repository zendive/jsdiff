<script>
  const api = require('../api');

  export default api.Vue.extend({
    name: 'jsdiff-panel',

    data() {
      return {
        git: {
          self: 'https://github.com/zendive/jsdiff',
          diffApi: 'https://github.com/benjamine/jsondiffpatch'
        },
        showUnchanged: true,
        compare: {
          timestamp: null,
          left: {},
          right: {}
        },
        now: Date.now(),
        timer: null
      };
    },

    mounted() {
      chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
        console.log('$_onRuntimeMessage', req);

        if (req.source === 'jsdiff-devtools-extension-api') {
          this.$_onDiffRequest(req.payload);
        }
      });

      chrome.runtime.sendMessage({type: 'jsdiff-devtools-panel-shown'}, (req) => {
        this.$_onDiffRequest(req.payload);
      });
      window.vm = this;
    },

    computed: {
      lastUpdated() {
        return api.moment(this.compare.timestamp).from(this.now);
      },
      hasBothSides() {
        return (
            this.$_hasData(this.compare.left) &&
            this.$_hasData(this.compare.right)
        );
      },
      exactMatch() {
        return !this.deltaHtml;
      },
      deltaHtml() {
        try {
          this.$_adjustArrows();
          return api.formatters.html.format(
              api.jsondiffpatch.diff(this.compare.left, this.compare.right),
              this.compare.left
          );
        }
        catch (bug) {
          return JSON.stringify(bug);
        }
      }
    },

    methods: {
      onToggleUnchanged(e) {
        this.showUnchanged = !this.showUnchanged;
        api.formatters.html.showUnchanged(this.showUnchanged, this.$refs.delta);
        this.$_adjustArrows();
      },

      onReinject() {
        chrome.runtime.sendMessage('jsdiff-panel-reinject');
      },

      onCopyDelta() {
        const delta = api.jsondiffpatch.diff(this.compare.left, this.compare.right);
        const sDelta = JSON.stringify(delta, null, 2);
        document.oncopy = function(e) {
          e.clipboardData.setData('text', sDelta);
          e.preventDefault();
        };
        document.execCommand('copy', false, null);
      },

      $_restartLastUpdated() {
        this.compare.timestamp = Date.now();

        this.timer = clearInterval(this.timer);
        this.timer = setInterval(() => {
          this.now = Date.now();
        }, 5e3);
      },

      $_hasData(o) {
        return (undefined !== o && null !== o);
      },

      $_onDiffRequest({left, right, push}) {
        if (push) {
          this.compare.left = this.compare.right;
          this.compare.right = push;
        }
        else {
          if (left) {
            this.compare.left = left;
          }
          if (right) {
            this.compare.right = right;
          }
        }

        this.$_restartLastUpdated();
      },

      $_adjustArrows() {
        this.$nextTick(() => {
          const t = document.body;
          var e = function(t) {
                return t.textContent || t.innerText;
              },
              o = function(t, e, o) {
                for (var a = t.querySelectorAll(e), r = 0, i = a.length; i > r; r++) {
                  o(a[r]);
                }
              },
              a = function(t, e) {
                for (var o = 0, a = t.children.length; a > o; o++) {
                  e(t.children[o], o);
                }
              };

          o(t, '.jsondiffpatch-arrow', function(t) {
            var o = t.parentNode,
                r = t.children[0],
                i = r.children[1];
            r.style.display = 'none';
            var n,
                s = e(o.querySelector('.jsondiffpatch-moved-destination')),
                d = o.parentNode;
            if (a(d, function(t) {
              t.getAttribute('data-key') === s && (n = t);
            }), n) {
              try {
                var f = n.offsetTop - o.offsetTop;
                r.setAttribute('height', Math.abs(f) + 6);
                t.style.top = -8 + (f > 0 ? 0 : f) + 'px';
                var l = f > 0 ?
                    'M30,0 Q-10,' + Math.round(f / 2) + ' 26,' + (f - 4) :
                    'M30,' + -f + ' Q-10,' + Math.round(-f / 2) + ' 26,4';
                i.setAttribute('d', l);
                r.style.display = '';
              } catch (c) {
                return;
              }
            }
          });
        });
      }

    }

  });
</script>

<template lang="Vue">
    <section id="app">
        <section class="-header">
            <div class="-title">JSDiff</div>

            <div class="-toolbox">
                <button
                    class="btn"
                    title="Inject console.diff API to current tab"
                    @click="onReinject"
                >Inject API</button>

                <button
                    v-if="hasBothSides"
                    class="btn"
                    title="Hide/Show unchanged properties"
                    @click="onToggleUnchanged"
                >Toggle Unchanged</button>

                <button
                    v-if="hasBothSides"
                    class="btn"
                    title="Copy delta as json string"
                    @click="onCopyDelta"
                >Copy</button>

            </div>

            <div v-if="hasBothSides"
                class="-last-updated">
                <span>Last updated</span>
                <span class="-value" v-text="lastUpdated"/>
            </div>
        </section>

        <section
            v-if="hasBothSides && exactMatch"
            class="-match">
            <code
                ref="delta"
                class="-center"
            >match</code>
        </section>
        <section v-else-if="hasBothSides && !exactMatch">
            <code
                ref="delta"
                class="-delta"
                v-html="deltaHtml"
            />
        </section>
        <section v-if="!hasBothSides"
            class="-empty">
            <div class="-center">
                <code>console.diff({a:1,b:1,c:3}, {a:1,b:2,d:3});</code>
                <div class="-links">
                    <a :href="git.diffApi" target="_blank">benjamine/jsondiffpatch</a>
                    <a :href="git.self" target="_blank">zendive/jsdiff</a>
                </div>
            </div>
        </section>

    </section>
</template>

<style scoped>
</style>
