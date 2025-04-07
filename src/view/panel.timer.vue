<template>
  <div class="panel-timer">
    <span v-text="'⏱️'" title="Last updated" />&nbsp;
    <span class="-value" v-text="elapsedTime" :title="envokedTime" />
  </div>
</template>

<script lang="ts" setup>
import { SECOND, timeFromNow, timeToString } from '../api/time.ts';
import { useCompareStore } from '../stores/compare.store.ts';
import { computed, onUnmounted, ref, watch } from 'vue';

const compareStore = useCompareStore();
let now = ref(0);
let interval = 0;

const elapsedTime = computed(() =>
  compareStore.compare.timestamp
    ? timeFromNow(compareStore.compare.timestamp, now.value)
    : ''
);
const envokedTime = computed(() =>
  compareStore.compare.timestamp
    ? timeToString(compareStore.compare.timestamp)
    : ''
);

watch(
  () => compareStore.compare.timestamp,
  () => {
    interval && clearInterval(interval);
    now.value = Date.now();
    interval = setInterval(() => {
      now.value = Date.now();
    }, SECOND);
  },
  {
    immediate: true,
  }
);

onUnmounted(() => {
  interval && clearInterval(interval);
});
</script>

<style lang="scss" scoped>
.panel-timer {
  cursor: default;

  .-value {
    color: var(--colour-text);
    font-size: 12px;
    opacity: 0.5;
  }
}
</style>
