<template lang="Vue">
    <section id="app">
        <section
            v-if="hasBothSides"
            class="-header">

            <div class="-toolbox">
                <button
                    v-if="hasBothSides"
                    class="btn"
                    title="Hide/Show unchanged properties"
                    @click="onToggleUnchanged"
                >Toggle Unchanged</button>

                <button v-if="hasBothSides"
                    class="btn"
                    title="Copy delta as json object"
                    @click="onCopyDelta"
                >Copy</button>
            </div>

            <div class="-last-updated">
                <span>Last updated</span>
                <span class="-value" v-text="lastUpdated"/>
            </div>
        </section>

        <a class="-icon" :href="git.self" target="_blank" :title="git.self">
          <img src="/src/img/panel-icon64.png" alt="JSDiff"/>
        </a>

        <section v-if="hasBothSides && exactMatch"
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

<script>
import jsondiffpatch from 'jsondiffpatch';
import 'jsondiffpatch/dist/formatters-styles/html.css';
import Vue from 'vue'
import {timeFromNow} from './api/time';
const formatters = jsondiffpatch.formatters;

export default Vue.extend({
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
          left: null,
          right: null
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
        if (null !== req) {
          this.$_onDiffRequest(req.payload);
        }
      });
      window.vm = this;
    },

    computed: {
      lastUpdated() {
        return timeFromNow(this.compare.timestamp, this.now);
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
          return formatters.html.format(
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
      onToggleUnchanged(e) {
        this.showUnchanged = !this.showUnchanged;
        formatters.html.showUnchanged(this.showUnchanged, this.$refs.delta);
      },

      onCopyDelta() {
        const delta = jsondiffpatch.diff(this.compare.left, this.compare.right);
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
    }

  });
</script>

<style lang="scss">
  $headerHeight: 26px;

  body {
    margin: 0;
    background-color: #fff;
  }

  .btn {
    height: $headerHeight;
    cursor: pointer;
    border: none;
    border-radius: 0;
    outline: none;
    background-color: rgba(0,0,0, 0.03);
    &:hover {
      background-color: rgba(0,0,0, 0.3);
    }
  }

  .-center {
    margin: 0 auto;
    text-align: center;
  }

  section#app {
    height: 100vh;

    section.-header {
      border-bottom: 1px solid #bbb;
      box-shadow: 1px 2px 5px #bbb;
      display: flex;
      align-items: center;
      height: $headerHeight;
      margin-bottom: 12px;
      min-width: 512px;

      .-toolbox {
        margin-left: 10px;
        .btn {
          margin-right: 2px;
        }
      }
      .-last-updated {
        margin-left: 10px;
        color: #bbbbbb;

        .-value {
          font-weight: bold;
        }
      }
    }

    .-icon {
      position: absolute;
      top: 7px;
      right: 10px;

      img {
        width: 32px;
      }
    }

    section.-match {
      display: flex;
      align-items: center;
      height: 100%;

      .-center {
        font-size: 26px;
        color: #bbb;
      }
    }

    section.-empty {
      display: flex;
      height: calc(100vh - #{$headerHeight});
      justify-content: center;
      align-items: center;

      .-links {
        margin-top: 16px;
        font-size: 11px;
      }

      .-center {
        font-size: 26px;
        color: #bbb;
      }
    }

    section.-delta {
      padding-top: 10px;
    }

  }

</style>
