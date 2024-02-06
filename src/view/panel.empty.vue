<template>
  <section class="-empty">
    <code v-text="state.codeExample" />
    <div class="-links">
      <a
        :href="state.diffApi"
        target="_blank"
        v-text="'benjamine/jsondiffpatch'"
      />,
      <a
        :href="packageJson.homepage"
        target="_blank"
        v-text="'zendive/jsdiff'"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import packageJson from '@/../package.json';

const state = {
  diffApi: 'https://github.com/benjamine/jsondiffpatch',
  codeExample: `${typeof browser !== 'undefined' ? 'jsdiff' : 'console'}.diff({a:1,b:1,c:3}, {a:1,b:2,d:3});`,
};
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
