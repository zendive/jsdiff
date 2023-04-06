<template>
  <section id="app">
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
      <code ref="deltaEl" class="-center">match</code>
    </section>
    <section v-else-if="hasBothSides && deltaHtml">
      <code ref="deltaEl" class="-delta" v-html="deltaHtml" />
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
import packageJson from '../../../package.json';
import * as jsondiffpatch from 'jsondiffpatch';
import 'jsondiffpatch/dist/formatters-styles/html.css';
import { timeFromNow } from './api/time.ts';
import { computed, onMounted, reactive, ref } from 'vue';

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

const deltaHtml = computed(() => {
  try {
    return formatters.html.format(
      jsondiffpatch.diff(state.compare.left, state.compare.right),
      state.compare.left
    );
  } catch (bug) {
    return JSON.stringify(bug);
  }
});

onMounted(() => {
  chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    console.log('$_onRuntimeMessage', req);

    if (req.source === 'jsdiff-devtools-extension-api') {
      $_onDiffRequest(req.payload);
    }
  });

  chrome.runtime.sendMessage({ type: 'jsdiff-devtools-panel-shown' }, (req) => {
    if (null !== req) {
      $_onDiffRequest(req.payload);
    }
  });
});

const onToggleUnchanged = () => {
  state.showUnchanged = !state.showUnchanged;
  formatters.html.showUnchanged(state.showUnchanged, deltaEl.value);
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
}

function $_hasData(o) {
  return undefined !== o && null !== o;
}
</script>

<style lang="scss">
$headerHeight: 26px;

body {
  margin: 0;
  padding: 0;
  background-color: #fff;
}

.btn {
  height: $headerHeight;
  cursor: pointer;
  border: none;
  border-radius: 0;
  outline: none;
  background-color: rgba(0, 0, 0, 0.03);

  &:hover {
    background-color: rgba(0, 0, 0, 0.3);
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
