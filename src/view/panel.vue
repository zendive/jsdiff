<template>
  <section class="jsdiff-panel" :class="state.uiTheme">
    <section class="-header">
      <progress-indicator v-if="state.inprogress" />

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

        <button
          class="btn"
          :title="`Clear results (${state.storagaSize})`"
          @click="onClearResults"
          v-text="'Clear'"
        />

        <div class="-last-updated">
          <span v-text="'⏱️'" title="Last updated" />&nbsp;
          <span class="-value" v-text="elapsedTime" :title="envokedTime" />
        </div>
      </div>

      <div
        v-if="state.lastError"
        class="-last-error"
        :title="'Last error'"
        v-text="state.lastError"
      />

      <div class="-badge">
        <div class="-version" v-text="state.version" />
        <a
          class="-icon"
          :href="state.git.self"
          target="_blank"
          :title="state.git.self"
        >
          <img src="/bundle/img/panel-icon64.png" alt="JSDiff" />
        </a>
      </div>
    </section>
    <section class="-body">
      <section v-if="hasBothSides && !deltaObj" class="-match">
        <div ref="deltaEl" class="-center">match</div>
      </section>
      <section v-else-if="hasBothSides && deltaObj" class="-content">
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
            <a
              :href="state.git.self"
              target="_blank"
              v-text="'zendive/jsdiff'"
            />
          </div>
        </div>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import packageJson from '@/../package.json';
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import * as jsondiffpatch from 'jsondiffpatch';
import { Delta } from 'jsondiffpatch';
import 'jsondiffpatch/dist/formatters-styles/html.css';
import { SECOND, timeFromNow, timeToString } from '@/api/time';
import { postDiffRender } from '@/api/formatter-dom';
import { searchQueryInDom } from '@/api/search';
import { hasValue } from '@/api/toolkit';
import progressIndicator from '@/view/progress-indicator.vue';

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
  inprogress: false,
  lastError: '',
  storagaSize: 0,
  uiTheme: 'light',
});
const compare = ref<ICompareState>({
  timestamp: 0,
  left: undefined,
  right: undefined,
});
let timer: number;
const elapsedTime = computed(() =>
  compare.value.timestamp ? timeFromNow(compare.value.timestamp, state.now) : ''
);
const envokedTime = computed(() =>
  compare.value.timestamp ? timeToString(compare.value.timestamp) : ''
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

$_initColourScheme();

onMounted(async () => {
  const { lastApiReq, lastError } = await chrome.storage.local.get([
    'lastApiReq',
    'lastError',
  ]);

  if (hasValue(lastApiReq)) {
    $_onDiffRequest(lastApiReq as ICompareState);
  }

  state.lastError = lastError || '';
  state.storagaSize = await chrome.storage.local.getBytesInUse();

  chrome.runtime.onMessage.addListener($_onRuntimeMessage);
  chrome.storage.onChanged.addListener(async () => {
    state.storagaSize = await chrome.storage.local.getBytesInUse();
  });
});

onUnmounted(() => {
  window.clearInterval(timer);
  chrome.runtime.onMessage.removeListener($_onRuntimeMessage);
});

const onToggleUnchanged = () => {
  if (hasValue(deltaEl.value)) {
    state.showUnchanged = !state.showUnchanged;
    formatters.html.showUnchanged(state.showUnchanged, deltaEl.value);
    searchQueryInDom(<HTMLElement>deltaEl.value, {
      cmd: 'cancelSearch',
      query: null,
    });
    postDiffRender(deltaEl.value);
  }
};

const onCopyDelta = async () => {
  const sDelta = JSON.stringify(deltaObj.value, null, 2);
  document.addEventListener('copy', function onCopy(e: ClipboardEvent) {
    e.preventDefault();
    document.removeEventListener('copy', onCopy);
    e.clipboardData?.setData('text', sDelta);
  });
  document.execCommand('copy', false);
};

const onClearResults = async () => {
  await chrome.storage.local.clear();
  compare.value = { left: undefined, right: undefined, timestamp: 0 };
  state.inprogress = false;
  state.lastError = '';
};

/**
 * DRAWBACK: if OS is dark but devtools is default - then theme is dark
 * no API to listen on devtools theme change
 */
function $_initColourScheme() {
  const devtoolScheme = chrome.devtools.panels.themeName;
  const osDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

  if (devtoolScheme === 'dark' || osDarkScheme.matches) {
    state.uiTheme = `dark`;
  }

  osDarkScheme.onchange = (e: MediaQueryListEvent) => {
    state.uiTheme = e.matches ? 'dark' : 'light';
  };
}

async function $_onRuntimeMessage(req: TRuntimeMessageOptions) {
  if ('jsdiff-proxy-to-panel-error' === req.source) {
    const { lastError } = await chrome.storage.local.get(['lastError']);
    state.lastError = lastError || '';
    state.inprogress = false;
  } else if (
    'jsdiff-proxy-to-panel-inprogress' === req.source &&
    typeof req.on === 'boolean'
  ) {
    state.inprogress = req.on;
  } else if ('jsdiff-proxy-to-panel-compare' === req.source) {
    state.lastError = '';
    const { lastApiReq } = await chrome.storage.local.get(['lastApiReq']);

    if (hasValue(lastApiReq)) {
      $_onDiffRequest(lastApiReq as ICompareState);
    }
  } else if (
    'jsdiff-devtools-to-panel-search' === req.source &&
    deltaEl.value &&
    req.params
  ) {
    searchQueryInDom(<HTMLElement>deltaEl.value, req.params);
  }
}

function $_restartElapsedTime() {
  window.clearInterval(timer);
  timer = window.setInterval(() => {
    state.now = Date.now();
  }, SECOND);
}

function $_onDiffRequest({ left, right, timestamp }: ICompareState) {
  compare.value = {
    left,
    right,
    timestamp: timestamp || Date.now(),
  };

  $_restartElapsedTime();
  postDiffRender(deltaEl.value).then(() => {
    state.inprogress = false;
  });
}
</script>

<style lang="scss">
:root {
  --colour-background: #fff;
  --colour-text: #000;
  --colour-text-diff: #000;
  --colour-found: 0, 222, 255;

  --header-height: 1.625rem;
  --header-background: #fff;
  --header-border: 1px solid #bbb;

  --button-background: rgba(0, 0, 0, 0.05);
  --button-hackground-hover: rgba(0, 0, 0, 0.3);

  --diff-added-background: #bbffbb;
  --diff-deleted-background: #ffbbbb;
}

.dark {
  --colour-background: rgb(32 33 36);
  --colour-text: rgb(189, 198, 207);
  --colour-found: 0, 191, 255;

  --header-background: rgb(41, 42, 45);
  --header-border: 1px solid rgb(73, 76, 80);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0 0 0 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
}

.jsdiff-panel {
  background-color: var(--colour-background);
  color: var(--colour-text);
  display: flex;
  flex-direction: column;
  height: 100vh;

  .-header {
    flex-shrink: 0;
    width: 100%;
    background-color: var(--header-background);
    border-bottom: var(--header-border);
    display: flex;
    align-items: center;
    height: var(--header-height);

    min-width: 512px;
    user-select: none;

    .-toolbox {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-left: 10px;

      .btn {
        height: var(--header-height);
        cursor: pointer;
        border: none;
        border-radius: 0;
        outline: none;
        background-color: var(--button-background);
        color: var(--colour-text);
        margin: 0 2px;

        &:hover {
          background-color: var(--button-hackground-hover);
        }
      }

      .-last-updated {
        cursor: default;
        margin-left: 10px;

        .-value {
          font-weight: bold;
          color: var(--colour-text);
          opacity: 0.5;
        }
      }
    }

    .-last-error {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-left: 10px;
      color: rgb(182, 33, 33);
    }

    .-badge {
      position: fixed;
      top: 0;
      right: 1rem;
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

  .-body {
    flex: 1 0 0%;
    overflow: auto;
    overflow-wrap: break-word;
    overflow-anchor: none;
    transform: translateZ(0);

    .-match {
      display: flex;
      align-items: center;
      height: 100%;

      .-center {
        margin: 0 auto;
        text-align: center;
        font-size: 26px;
        color: #bbb;
      }
    }

    .-empty {
      display: flex;
      height: calc(100vh - var(--header-height));
      justify-content: center;
      align-items: center;

      .-links {
        margin-top: 16px;
        font-size: 11px;
      }

      .-center {
        margin: 0 auto;
        text-align: center;
        font-size: 26px;
        color: #bbb;
      }
    }

    .-content {
      padding: 0.5rem 0;

      .-delta {
        .jsdiff-found {
          outline: 2px solid rgba(var(--colour-found), 1);
          outline-offset: -1px;

          &.jsdiff-found-this {
            color: var(--colour-text-diff);
            animation: found_this 0.8s infinite alternate;
          }

          @keyframes found_this {
            0% {
              background-color: rgba(var(--colour-found), 0.6);
            }

            100% {
              background-color: rgba(var(--colour-found), 1);
            }
          }
        }
      }
    }
  }

  .jsondiffpatch-delta pre {
    white-space: pre-wrap;
    word-break: break-all;
  }

  .jsondiffpatch-added .jsondiffpatch-property-name,
  .jsondiffpatch-added .jsondiffpatch-value pre,
  .jsondiffpatch-modified .jsondiffpatch-right-value pre,
  .jsondiffpatch-textdiff-added {
    background: var(--diff-added-background);
    color: var(--colour-text-diff);
  }

  .jsondiffpatch-deleted .jsondiffpatch-property-name,
  .jsondiffpatch-deleted pre,
  .jsondiffpatch-modified .jsondiffpatch-left-value pre,
  .jsondiffpatch-textdiff-deleted {
    background: var(--diff-deleted-background);
    text-decoration: line-through;
    color: var(--colour-text-diff);
  }
}
</style>
