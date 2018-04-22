define(['api'], function(api) {
  'use strict';
  // language=Vue
  return api.Vue.extend({
    name: 'app',

    render(ce) {
      return ce('section', {attrs: {id: 'app'}}, [
        ce('section', {class: ['-header']}, [
          ce('div', {class: ['-title']}, 'JSDiff'),
          ce('div', {class: ['-toolbox']}, [
            ce('button', {
              class: ['btn'],
              on: {click: this.onReinject}
            }, 'Inject API'),
            (this.hasBothSides ?
                    ce('button', {
                      class: ['btn'],
                      on: {click: this.onToggleUnchanged}
                    }, 'Toggle Unchanged')
                    : null
            )
          ]),
          (this.hasBothSides ?
                  ce('div', {class: ['-last-updated']}, [
                    ce('span', 'Last updated: '),
                    ce('span', {class: ['-value']}, this.lastUpdated)
                  ])
                  : null
          )
        ]),

        (this.hasBothSides ?
                (this.exactMatch ?
                        ce('section', {class: ['-match']}, [
                          ce('code', {class: ['-center']}, ['match'])
                        ])
                        : ce('section', {
                          ref: 'delta',
                          class: ['-delta'],
                          domProps: {innerHTML: this.deltaHtml}
                        })
                )
                : ce('section', {class: ['-empty']}, [
                  ce('div', {class: ['-center']}, [
                    ce('code', {}, [
                      'console.diff({a:1,b:1}, {a:1,b:2});'
                    ]),
                    ce('div', {class: ['-links']}, [
                      'This extension based on ',
                      ce('a', {attrs: {href: this.git.diffApi, target: '_blank'}}, 'jsondiffpatch'),
                      ' and available at ',
                      ce('a', {attrs: {href: this.git.self, target: '_blank'}}, 'github'),
                      '.'
                    ])
                  ])
                ])
        )
      ]);
    },

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
      this.$on('on-runtime-message', this.$_onRuntimeMessage);
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
          return api.formatter.html.format(
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
        api.formatter.html.showUnchanged(this.showUnchanged, this.$refs.delta);
        this.$_adjustArrows();
      },

      onReinject() {
        chrome.runtime.sendMessage('jsdiff-panel-reinject');
      },

      $_restartLastUpdated() {
        this.compare.timestamp = Date.now();

        this.timer = clearInterval(this.timer);
        this.timer = setInterval(() => {
          this.now = Date.now();
        }, 5e3);
      },

      $_onRuntimeMessage(req, sender, sendResponse) {
        console.log('$_onRuntimeMessage', req);

        if (req.source === 'jsdiff-devtools-extension-api') {
          this.$_onDiffRequest(req.payload);
        }
      },

      $_hasData(o) {
        if (o) {
          const t = typeof(o);
          if (t === 'object') {
            return Object.keys(o).length > 0;
          }
          else if (t === 'string') {
            return true;
          }
        }
        return false;
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
});
