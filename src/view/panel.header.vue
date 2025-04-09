<template>
  <header class="header">
    <panel-loader v-if="!compareStore.initialized || compareStore.inprogress" />

    <div v-if="compareStore.hasBothSides" class="-toolbox">
      <button
        v-if="compareStore.deltaObj"
        class="btn"
        title="Hide/Show unchanged properties"
        @click="emit('toggleUnchanged')"
      >
        <span
          class="icon -toggle-unchanged"
          :class="
            {
              '-on': compareStore.showOnlyChanged,
            }
          "
        />
      </button>

      <button
        v-if="compareStore.deltaObj"
        class="btn"
        title="Copy delta as json object"
        @click="emit('copyDelta')"
      >
        <span class="icon -copy" />
      </button>

      <button class="btn" title="Clear results" @click="onClearResults">
        <span class="icon -clear" />
      </button>

      <panel-search v-if="compareStore.deltaObj" />
      <panel-timer />
    </div>

    <div
      v-if="compareStore.lastError"
      class="-last-error"
      :title="'Last error'"
      v-text="compareStore.lastError"
    />

    <panel-badge />
  </header>
</template>

<script setup lang="ts">
import { useCompareStore } from '../stores/compare.store.ts';
import { useSearchStore } from '../stores/search.store.ts';
import PanelLoader from '../view/panel.loader.vue';
import PanelTimer from '../view/panel.timer.vue';
import PanelBadge from '../view/panel.badge.vue';
import PanelSearch from '../view/panel.search.vue';

const compareStore = useCompareStore();
const searchStore = useSearchStore();
const emit = defineEmits<{
  (e: 'toggleUnchanged'): void;
  (e: 'copyDelta'): void;
}>();

const onClearResults = () => {
  compareStore.clear();
  searchStore.clear();
};
</script>

<style lang="scss">
.header {
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

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      height: var(--header-height);
      cursor: pointer;
      border: none;
      border-radius: 0;
      outline: none;
      background-color: var(--button-background);
      color: var(--colour-text);

      &:hover {
        background-color: var(--button-background-hover);
      }
    }

    .panel-timer {
      margin-left: 10px;
    }
  }

  .icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    background-color: var(--colour-text);
    -webkit-mask-size: cover;
    mask-size: cover;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;

    &.-clear {
      -webkit-mask-image: url(./svg/clear.svg);
      mask-image: url(./svg/clear.svg);
    }
    &.-copy {
      -webkit-mask-image: url(./svg/copy-to-clipboard.svg);
      mask-image: url(./svg/copy-to-clipboard.svg);
    }
    &.-toggle-unchanged {
      -webkit-mask-image: url(./svg/filter.svg);
      mask-image: url(./svg/filter.svg);
      &.-on {
        -webkit-mask-image: url(./svg/filter-filled.svg);
        mask-image: url(./svg/filter-filled.svg);
      }
    }
  }

  .-last-error {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 10px;
    color: var(--colour-error);
  }
}
</style>
