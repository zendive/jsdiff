<template>
  <div class="panel-search">
    <input
      ref="searchEl"
      type="text"
      placeholder="Search..."
      :class="{ '-empty': !searchStore.userQuery.length }"
      v-model.trim="searchStore.userQuery"
      @keydown="onSearchKeydown"
    />

    <template v-if="hasContext">
      <button class="btn" @click="onPrevSearch" title="Show previous [⇧+⏎]">
        <span class="icon -arrow-up" />
      </button>
      <button class="btn" @click="onNextSearch" title="Show next [⏎]">
        <span class="icon -arrow-down" />
      </button>
      <div
        class="-context-counter"
        :class="{ '-out-of-sync': searchStore.outOfSync }"
        v-text="contextCounter"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useSearchStore } from '../stores/search.store.ts';
import { isSearchKeyboardEvent } from '../api/toolkit.ts';

const searchStore = useSearchStore();
const searchEl = ref<HTMLInputElement | null>(null);
const hasContext = computed(() => {
  return searchStore.foundEls.length !== 0;
});
const contextCounter = computed(() => {
  return `${searchStore.currentIndex + 1}/${searchStore.foundEls.length}`;
});

/**
 * Intercept ^+F to move focus into internal search rather than
 * activate default chrome devtools search interface.
 */
const interceptDefaultSearchPanel = (e: KeyboardEvent) => {
  if (isSearchKeyboardEvent(e)) {
    e.stopImmediatePropagation(); // prevent find in devtools
    e.preventDefault(); // pervent find in inspected window
    searchEl.value?.focus(); // finally, enable focus on internall search element
  }
};

onMounted(() => {
  window.addEventListener('keydown', interceptDefaultSearchPanel, {
    capture: true,
  });
});

onUnmounted(() => {
  window.removeEventListener('keydown', interceptDefaultSearchPanel, {
    capture: true,
  });
});

const onSearchKeydown = (e: KeyboardEvent) => {
  if ('Enter' === e.key) {
    if (e.shiftKey) {
      searchStore.searchNext(-1, true);
    } else {
      searchStore.searchNext(1, true);
    }
  } else if ('Escape' === e.key) {
    searchEl.value?.blur();
    e.stopPropagation();
    searchStore.searchCancel();
  }
};

const onPrevSearch = () => {
  searchStore.searchNext(-1, false);
};

const onNextSearch = () => {
  searchStore.searchNext(1, false);
};
</script>

<style lang="scss">
.panel-search {
  display: flex;

  input {
    color: var(--colour-text);
    background-color: var(--input-background-active);
    border: unset;
    outline: unset;
    width: 180px;
    height: var(--header-height);
    transition: width 0.1s ease-out;

    &.-empty:not(:focus) {
      width: 60px;
      background-color: var(--input-background-idle);
    }
  }

  .icon {
    &.-arrow-up {
      -webkit-mask-image: url(./svg/arrow-up.svg);
      mask-image: url(./svg/arrow-up.svg);
    }

    &.-arrow-down {
      -webkit-mask-image: url(./svg/arrow-down.svg);
      mask-image: url(./svg/arrow-down.svg);
    }
  }

  .-context-counter {
    display: flex;
    align-items: center;
    margin-left: 10px;
    color: rgb(var(--colour-found-this-background));
    font-size: 12px;
    font-weight: bold;

    &.-out-of-sync {
      text-decoration: line-through;
    }
  }
}
</style>
