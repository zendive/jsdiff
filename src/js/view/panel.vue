<template>
  <section class="jsdiff-panel">
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

    <section v-if="hasBothSides && !deltaObj" class="-match">
      <div ref="deltaEl" class="-center">match</div>
    </section>
    <section v-else-if="hasBothSides && deltaObj">
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

<script setup lang="ts">
import packageJson from '../../../package.json';
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import * as jsondiffpatch from 'jsondiffpatch';
import { Delta } from 'jsondiffpatch';
import 'jsondiffpatch/dist/formatters-styles/html.css';
import { SECOND, timeFromNow } from './api/time';
import { postDiffRender } from './api/formatter-dom';
import { searchQueryInDom, ISearchOptions } from './api/search';
import { hasValue } from './api/toolkit';

interface ICompareState {
  timestamp?: number;
  left?: unknown;
  right?: unknown;
}

const formatters = jsondiffpatch.formatters;
const deltaEl = ref<HTMLElement | null>(null);
const appStartTimestamp = Date.now();
const state = reactive({
  version: packageJson.version,
  git: {
    self: 'https://github.com/zendive/jsdiff',
    diffApi: 'https://github.com/benjamine/jsondiffpatch',
  },
  codeExample: 'console.diff({a:1,b:1,c:3}, {a:1,b:2,d:3});',
  showUnchanged: true,
  now: appStartTimestamp,
});
const compare = ref<ICompareState>({
  timestamp: undefined,
  left: undefined,
  right: undefined,
});
let timer: number;
const lastUpdated = computed(() =>
  compare.value.timestamp ? timeFromNow(compare.value.timestamp, state.now) : ''
);
const hasBothSides = computed(
  () => hasValue(compare.value.left) && hasValue(compare.value.right)
);
const deltaObj = computed(() =>
  jsondiffpatch.diff(compare.value.left, compare.value.right)
);
const deltaHtml = computed(() => {
  try {
    if (deltaObj.value) {
      return formatters.html.format(<Delta>deltaObj.value, compare.value.left);
    } else {
      return '';
    }
  } catch (bug) {
    return JSON.stringify(bug);
  }
});

onMounted(async () => {
  const { lastApiReq } = await chrome.storage.local.get(['lastApiReq']);
  if (hasValue(lastApiReq)) {
    $_onDiffRequest(lastApiReq);
  }
  chrome.runtime.onMessage.addListener($_onRuntimeMessage);
});

onUnmounted(() => {
  window.clearInterval(timer);
  chrome.runtime.onMessage.removeListener($_onRuntimeMessage);
});

const onToggleUnchanged = () => {
  if (hasValue(deltaEl.value)) {
    state.showUnchanged = !state.showUnchanged;
    formatters.html.showUnchanged(state.showUnchanged, deltaEl.value);
    postDiffRender(deltaEl.value);
  }
};

const onCopyDelta = async () => {
  const sDiff = JSON.stringify(deltaObj.value, null, 2);
  await navigator.clipboard.writeText(sDiff);
};

function $_onRuntimeMessage(req) {
  if ('jsdiff-devtools-to-panel-compare' === req.source && req.payload) {
    $_onDiffRequest(req.payload);
  } else if (
    'jsdiff-devtools-to-panel-search' === req.source &&
    deltaEl.value
  ) {
    searchQueryInDom(<HTMLElement>deltaEl.value, <ISearchOptions>req.params);
  }
}

function $_restartLastUpdated() {
  window.clearInterval(timer);
  timer = window.setInterval(() => {
    state.now = Date.now();
  }, SECOND);
}

function $_onDiffRequest({ left, right, timestamp }: ICompareState) {
  // console.log('$_onDiffRequest');
  compare.value.left = left;
  compare.value.right = right;
  compare.value.timestamp = timestamp || Date.now();

  $_restartLastUpdated();
  postDiffRender(deltaEl.value);
}
</script>

<style lang="scss">
:root {
  --colour-background: #fff;
  --colour-text: #000;
  --colour-found: 0, 191, 255;
  --height-header: 1.625rem;
}

body {
  margin: 0;
  padding: 0;
}

.jsdiff-panel {
  height: 100vh;
  background-color: var(--colour-background);
  color: var(--colour-text);

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

    .jsdiff-found {
      outline: 1px solid rgba(var(--colour-found), 0.6);
      outline-offset: -1px;

      &.jsdiff-found-this {
        outline: 2px solid rgb(var(--colour-found));
        outline-offset: -2px;
        animation: found_this 1s infinite;
      }

      @keyframes found_this {
        0% {
          background-color: transparent;
        }
        50% {
          background-color: rgba(var(--colour-found), 0.2);
        }
      }
    }
  }
}
</style>
