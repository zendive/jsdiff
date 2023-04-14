<template>
  <section id="jsdiff-panel">
    <section class="-header">
      <div v-if="hasBothSides" class="-toolbox">
        <button
          class="btn"
          title="Hide/Show unchanged properties"
          @click="onToggleUnchanged"
          v-text="'Toggle Unchanged'"
        />

        <button
          class="btn"
          title="Copy delta as json object"
          @click="onCopyDelta"
          v-text="'Copy'"
        />

        <div class="-last-updated">
          <span v-text="'Last updated '" />
          <span class="-value" v-text="lastUpdated" />
        </div>
      </div>

      <div class="-badge">
        <div class="-version" v-text="state.version" />
        <a
          class="-icon"
          :href="state.git.self"
          target="_blank"
          :title="state.git.self"
        >
          <img src="/src/img/panel-icon64.png" alt="JSDiff" />
        </a>
      </div>
    </section>

    <section v-if="hasBothSides && !deltaHtml" class="-match">
      <div ref="deltaEl" class="-center">match</div>
    </section>
    <section v-else-if="hasBothSides && deltaHtml">
      <div ref="deltaEl" class="-delta" v-html="deltaHtml" />
    </section>
    <section v-if="!hasBothSides" class="-empty">
      <div class="-center">
        <code v-text="state.codeExample" />
        <div class="-links">
          <a
            :href="state.git.diffApi"
            target="_blank"
            v-text="'benjamine/jsondiffpatch'"
          />,
          <a :href="state.git.self" target="_blank" v-text="'zendive/jsdiff'" />
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import packageJson from '../../../package.json';
import * as jsondiffpatch from 'jsondiffpatch';
import 'jsondiffpatch/dist/formatters-styles/html.css';
import { timeFromNow } from './api/time.ts';
import { postDiffRender } from './api/html-helper.ts';

const formatters = jsondiffpatch.formatters;
const deltaEl = ref(null);
const appStartTimestamp = Date.now();
const state = reactive({
  version: packageJson.version,
  git: {
    self: 'https://github.com/zendive/jsdiff',
    diffApi: 'https://github.com/benjamine/jsondiffpatch',
  },
  codeExample: 'console.diff({a:1,b:1,c:3}, {a:1,b:2,d:3});',
  showUnchanged: true,
  compare: {
    timestamp: appStartTimestamp,
    left: null,
    right: null,
  },
  now: appStartTimestamp,
  timer: null,
});

const lastUpdated = computed(() =>
  timeFromNow(state.compare.timestamp, state.now)
);

const hasBothSides = computed(
  () => $_hasData(state.compare.left) && $_hasData(state.compare.right)
);

const deltaObj = computed(() =>
  jsondiffpatch.diff(state.compare.left, state.compare.right)
);

const deltaHtml = computed(() => {
  try {
    return formatters.html.format(deltaObj.value, state.compare.left);
  } catch (bug) {
    return JSON.stringify(bug);
  }
});

onMounted(() => {
  chrome.storage.local.get(['lastApiReq']).then(({ lastApiReq }) => {
    if (lastApiReq && lastApiReq.payload) {
      $_onDiffRequest(lastApiReq.payload);
    }
  });

  chrome.runtime.onMessage.addListener((req) => {
    if ('jsdiff-devtools-extension-api' === req.source && req.payload) {
      $_onDiffRequest(req.payload);
    } else if ('jsdiff-panel-search' === req.source) {
      /**
       * cmd = 'performSearch'|'nextSearchResult'|'cancelSearch'
       */
      const { cmd, query } = req.params;
      console.log('🔦', cmd, query);
    }
  });
});

const onToggleUnchanged = () => {
  state.showUnchanged = !state.showUnchanged;
  formatters.html.showUnchanged(state.showUnchanged, deltaEl.value);
  postDiffRender(deltaEl.value);
};

const onCopyDelta = () => {
  const diff = jsondiffpatch.diff(state.compare.left, state.compare.right);
  const sDiff = JSON.stringify(diff, null, 2);

  document.oncopy = function (e) {
    e.clipboardData.setData('text', sDiff);
    e.preventDefault();
  };
  document.execCommand('copy', false, null);
  // modern alternative, but don't have permission [?]
  // navigator.clipboard.writeText(sDiff).then(
  //   () => {
  //     console.log('clipboard successfully set');
  //   },
  //   (e) => {
  //     console.error('clipboard write failed', e);
  //   }
  // );
};

function $_restartLastUpdated() {
  state.compare.timestamp = Date.now();

  clearInterval(state.timer);
  state.timer = window.setInterval(() => {
    state.now = Date.now();
  }, 1e3);
}

function $_onDiffRequest({ left, right, push }) {
  if (push) {
    state.compare.left = state.compare.right;
    state.compare.right = push;
  } else {
    if (left) {
      state.compare.left = left;
    }
    if (right) {
      state.compare.right = right;
    }
  }

  $_restartLastUpdated();
  postDiffRender(deltaEl.value);
}

function $_hasData(o) {
  return undefined !== o && null !== o;
}
</script>

<style lang="scss">
:root {
  --color-background: #fff;
  --color-text: #000;
  --height-header: 1.625rem;
}

body {
  margin: 0;
  padding: 0;
}

#jsdiff-panel {
  height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);

  .btn {
    height: var(--height-header);
    cursor: pointer;
    border: none;
    border-radius: 0;
    outline: none;
    background-color: rgba(0, 0, 0, 0.03);

    &:hover {
      background-color: rgba(0, 0, 0, 0.3);
    }
  }

  .-header {
    border-bottom: 1px solid #bbb;
    box-shadow: 1px 2px 5px #bbb;
    display: flex;
    align-items: center;
    height: var(--height-header);
    margin-bottom: 12px;
    min-width: 512px;

    .-toolbox {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-left: 10px;

      .btn {
        margin: 0 2px;
      }

      .-last-updated {
        margin-left: 10px;
        color: #bbbbbb;

        .-value {
          font-weight: bold;
        }
      }
    }

    .-badge {
      position: fixed;
      top: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4px 4px;

      .-version {
        font-family: monospace;
      }

      .-icon {
        img {
          width: 32px;
        }
      }
    }
  }

  .-center {
    margin: 0 auto;
    text-align: center;
  }

  .-match {
    display: flex;
    align-items: center;
    height: 100%;

    .-center {
      font-size: 26px;
      color: #bbb;
    }
  }

  .-empty {
    display: flex;
    height: calc(100vh - var(--height-header));
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

  .-delta {
    padding-top: 10px;
  }
}
</style>
