<template>
  <section class="-empty">
    <code>{{ HOST_NAME }}.diff({a:1, b:1, c:3}, {a:1, b:2, d:3});</code>
    <div class="-links">
      <div>
        Source code on GitHub
        <a :href="APP_HOMEPAGE" target="_blank" v-text="'zendive/jsdiff'" />
      </div>
      <div>
        Based on
        <a
          :href="APP_DIFFAPI"
          target="_blank"
          v-text="'benjamine/jsondiffpatch'"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { APP_DIFFAPI } from '../api/const.ts';
import { APP_HOMEPAGE } from '../api/env.ts';

const HOST_NAME = __firefox__ ? 'jsdiff' : 'console';
</script>

<style scoped lang="scss">
.-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: calc(100vh - var(--header-height));
  margin: 0 auto;
  font-size: 26px;
  color: var(--colour-text);

  .-links {
    margin-top: 16px;
    font-size: 11px;
  }
}
</style>
