<template>
  <div class="badge">
    <div class="-version" v-text="APP_VERSION" />
    <a class="-icon" target="_blank" :href="APP_HOMEPAGE" :title="APP_HOMEPAGE">
      <img src="public/img/panel-icon64.png" alt="JSDiff" />
    </a>
  </div>
</template>

<script lang="ts" setup>
import { APP_HOMEPAGE, APP_VERSION } from '../api/env.ts';
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
