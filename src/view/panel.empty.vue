<template>
  <section class="-empty">
    <code v-text="APP_CODE_EXAMPLE" />
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
import { APP_DIFFAPI, APP_CODE_EXAMPLE } from '@/api/const.ts';
import { APP_HOMEPAGE } from '@/api/env.ts';
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
