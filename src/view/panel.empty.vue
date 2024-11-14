<template>
  <section class="-empty">
    <code v-text="APP_CODE_EXAMPLE" />
    <div class="-links">
      <a
        :href="APP_DIFFAPI"
        target="_blank"
        v-text="'benjamine/jsondiffpatch'"
      />,
      <a :href="APP_HOMEPAGE" target="_blank" v-text="'zendive/jsdiff'" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { APP_DIFFAPI, APP_CODE_EXAMPLE } from '@/api/const.ts';
import { APP_HOMEPAGE } from '@/api/env.ts';
</script>

<style scoped lang="scss">
.-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
