<template>
  <main class="jsdiff-panel" :class="colourScheme">
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
import { watch, onUnmounted, ref, watchEffect } from 'vue';
import { useCompareStore } from '@/stores/compare.store.ts';
import { useSearchStore } from '@/stores/search.store.ts';
import PanelHeader from '@/view/panel.header.vue';
import PanelEmpty from '@/view/panel.empty.vue';
import { onColourSchemeChange } from '@/api/onColourSchemeChange.ts';
import { buildDeltaElement, hideUnchanged } from '@/api/deltaHtml/api';

const compareStore = useCompareStore();
const searchStore = useSearchStore();
const deltaEl = ref<HTMLElement | null>(null);
const colourScheme = ref('light');

watch(
  () => compareStore.deltaObj,
  () => {
    if (deltaEl.value) {
      const tmpEl = buildDeltaElement(
        compareStore.deltaObj,
        compareStore.compare.left,
        compareStore.showOnlyChanged
      );
      tmpEl && deltaEl.value.replaceChildren(tmpEl);
    }
  },
  { flush: 'post' }
);

watchEffect(
  () => {
    searchStore.assignDeltaElement(deltaEl.value);
  },
  { flush: 'post' }
);

onColourSchemeChange((schemeName) => {
  colourScheme.value = schemeName;
});

const onToggleUnchanged = () => {
  if (deltaEl.value) {
    searchStore.searchCancel();
    compareStore.showOnlyChanged = !compareStore.showOnlyChanged;
    hideUnchanged(
      compareStore.showOnlyChanged,
      deltaEl.value.firstElementChild
    );
  }
};

const onCopyDelta = () => {
  const sDelta = JSON.stringify(compareStore.deltaObj, null, 2);
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
  --colour-background: #fff;
  --colour-text: #000;
  --colour-text-diff: #000;

  --colour-found-outline: 0, 0, 0;
  --colour-found-this-background: 0, 0, 0;
  --colour-found-this-text: 255, 255, 255;

  --header-height: 1.625rem;
  --header-background: #fff;
  --header-border: 1px solid #bbb;

  --button-background: rgba(0, 0, 0, 0.05);
  --button-background-hover: rgba(0, 0, 0, 0.3);

  --input-background-idle: rgba(0, 0, 0, 0.05);
  --input-background-active: rgba(0, 0, 0, 0.1);

  --diff-added-background: #bbffbb;
  --diff-deleted-background: #ffbbbb;
}

.dark {
  --colour-background: rgb(32 33 36);
  --colour-text: rgb(189, 198, 207);

  --colour-found-outline: 255, 255, 255;
  --colour-found-this-background: 255, 255, 255;
  --colour-found-this-text: 0, 0, 0;

  --input-background-idle: rgba(0, 0, 0, 0.05);
  --input-background-active: rgba(0, 0, 0, 0.3);

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

  .-body {
    flex: 1 0 0%;
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
          outline: 2px solid rgba(var(--colour-found-outline), 1);
          outline-offset: -1px;
          font-weight: bold;

          &.jsdiff-found-this {
            font-weight: bold;
            color: rgba(var(--colour-found-this-text), 1);
            background-color: rgba(var(--colour-found-this-background), 1);
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
