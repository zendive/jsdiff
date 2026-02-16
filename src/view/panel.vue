<template>
  <main class="jsdiff-panel">
    <panel-header
      @toggle-unchanged="onToggleUnchanged"
      @copy-delta="onCopyDelta"
    />

    <section v-if="compareStore.initialized" class="-body">
      <template v-if="compareStore.hasBothSides">
        <section v-if="compareStore.deltaObj" class="-content">
          <div ref="deltaEl" class="-delta" />
        </section>
        <section v-else class="-match">match</section>
      </template>
      <panel-empty v-else />
    </section>
  </main>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch, watchEffect } from 'vue';
import { useCompareStore } from '../stores/compare.store.ts';
import { useSearchStore } from '../stores/search.store.ts';
import PanelHeader from './panel.header.vue';
import PanelEmpty from './panel.empty.vue';
import {
  buildDeltaElement,
  formatDeltaAsRFC6902,
  hideUnchanged,
} from '../api/diffApi.ts';

const compareStore = useCompareStore();
const searchStore = useSearchStore();
const deltaEl = ref<HTMLElement | null>(null);

watch(
  () => compareStore.deltaObj,
  () => {
    if (deltaEl.value) {
      const tmpEl = buildDeltaElement(
        compareStore.deltaObj,
        compareStore.compare.left,
        compareStore.showOnlyChanged,
      );
      tmpEl && deltaEl.value.replaceChildren(tmpEl);
    }
  },
  { flush: 'post' },
);

watchEffect(
  () => {
    searchStore.assignDeltaElement(deltaEl.value);
  },
  { flush: 'post' },
);

const onToggleUnchanged = () => {
  if (deltaEl.value) {
    searchStore.searchCancel();
    compareStore.showOnlyChanged = !compareStore.showOnlyChanged;
    hideUnchanged(
      compareStore.showOnlyChanged,
      deltaEl.value.firstElementChild,
    );
  }
};

const onCopyDelta = () => {
  const delta = formatDeltaAsRFC6902(compareStore.deltaObj);
  const sDelta = JSON.stringify(delta, null, 2);

  document.addEventListener('copy', function onCopy(e: ClipboardEvent) {
    e.preventDefault();
    document.removeEventListener('copy', onCopy);
    e.clipboardData?.setData('text', sDelta);
  });
  document.execCommand('copy', false);
};

onUnmounted(() => {
  searchStore.searchCancel();
});
</script>

<style lang="scss">
:root {
  color-scheme: light dark;
  --colour-background: light-dark(#fff, rgb(32 33 36));
  --colour-text: light-dark(#000, rgb(189, 198, 207));
  --colour-error: light-dark(rgb(182, 33, 33), rgb(211, 231, 26));
  --colour-text-diff: #000;

  --colour-found-outline: light-dark(rgb(0 0 0), rgb(100% 100% 100%));
  --colour-found-this-background: light-dark(rgb(0 0 0), rgb(100% 100% 100%));
  --colour-found-this-text: light-dark(rgb(100% 100% 100%), rgb(0 0 0));

  --header-height: 1.625rem;
  --header-background: light-dark(#fff, rgb(41, 42, 45));
  --header-border: light-dark(#bbb, rgb(73, 76, 80));

  --button-background: rgba(0, 0, 0, 0.05);
  --button-background-hover: rgba(0, 0, 0, 0.3);

  --input-background-idle: light-dark(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.1));
  --input-background-active: light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.9));

  --diff-added-background: #bbffbb;
  --diff-deleted-background: #ffbbbb;
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

a {
  color: var(--colour-text);
}

.jsdiff-panel {
  background-color: var(--colour-background);
  color: var(--colour-text);
  display: flex;
  flex-direction: column;
  height: 100vh;

  .-body {
    flex: 1 0 0;
    overflow: auto;
    overflow-wrap: break-word;
    overflow-anchor: none;
    transform: translateZ(0);

    .-match {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      margin: 0 auto;
      text-align: center;
      font-size: 26px;
      font-family: monospace;
      color: var(--colour-text);
    }

    .-content {
      padding: 0.5rem 0;

      .-delta {
        .jsdiff-found {
          outline: 2px solid var(--colour-found-outline);
          outline-offset: -1px;
          font-weight: bold;

          &.jsdiff-found-this {
            font-weight: bold;
            color: var(--colour-found-this-text);
            background-color: var(--colour-found-this-background);
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
    text-decoration: unset;
    color: var(--colour-text-diff);
  }
}
</style>
