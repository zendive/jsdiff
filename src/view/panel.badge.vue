<template>
  <div class="badge">
    <div class="-version" v-text="packageJson.version" />
    <a
      class="-icon"
      target="_blank"
      :href="packageJson.homepage"
      :title="packageJson.homepage"
    >
      <img src="/bundle/img/panel-icon64.png" alt="JSDiff" />
    </a>
  </div>
</template>

<script lang="ts" setup>
import packageJson from '@/../package.json';
</script>

<style lang="scss" scoped>
.badge {
  position: fixed;
  top: 0;
  right: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 4px;
  z-index: 1;

  .-version {
    font-family: monospace;
  }

  .-icon {
    img {
      width: 32px;
    }
  }
}
</style>
