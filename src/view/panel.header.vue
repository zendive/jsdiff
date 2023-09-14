<template>
  <header class="header">
    <panel-loader v-if="props.pending" />

    <div v-if="props.showControls" class="-toolbox">
      <button
        class="btn"
        title="Hide/Show unchanged properties"
        @click="emit('toggleUnchanged')"
        v-text="'Toggle Unchanged'"
      />

      <button
        class="btn"
        title="Copy delta as json object"
        @click="emit('copyDelta')"
        v-text="'Copy'"
      />

      <button
        class="btn"
        :title="`Clear results (${props.storagaSize})`"
        @click="emit('clearResults')"
        v-text="'Clear'"
      />

      <div class="-last-updated">
        <span v-text="'⏱️'" title="Last updated" />&nbsp;
        <span
          class="-value"
          v-text="props.elapsedTime"
          :title="props.envokedTime"
        />
      </div>
    </div>

    <div
      v-if="props.lastError"
      class="-last-error"
      :title="'Last error'"
      v-text="props.lastError"
    />

    <div class="-badge">
      <div class="-version" v-text="stale.version" />
      <a
        class="-icon"
        :href="props.linkGitSelf"
        target="_blank"
        :title="props.linkGitSelf"
      >
        <img src="/bundle/img/panel-icon64.png" alt="JSDiff" />
      </a>
    </div>
  </header>
</template>

<script setup lang="ts">
import packageJson from '@/../package.json';
import PanelLoader from '@/view/panel.loader.vue';

const props = defineProps<{
  pending: boolean;
  showControls: boolean;
  lastError: undefined | string;
  elapsedTime: string;
  envokedTime: string;
  storagaSize: number;
  linkGitSelf: string;
}>();

const emit = defineEmits<{
  (e: 'toggleUnchanged'): void;
  (e: 'copyDelta'): void;
  (e: 'clearResults'): void;
}>();

const stale = {
  version: packageJson.version,
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
    padding-left: 10px;

    .btn {
      height: var(--header-height);
      cursor: pointer;
      border: none;
      border-radius: 0;
      outline: none;
      background-color: var(--button-background);
      color: var(--colour-text);
      margin: 0 2px;

      &:hover {
        background-color: var(--button-hackground-hover);
      }
    }

    .-last-updated {
      cursor: default;
      margin-left: 10px;

      .-value {
        font-weight: bold;
        color: var(--colour-text);
        opacity: 0.5;
      }
    }
  }

  .-last-error {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 10px;
    color: rgb(182, 33, 33);
  }

  .-badge {
    position: fixed;
    top: 0;
    right: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 4px;

    .-version {
      font-family: monospace;
    }

    .-icon {
      img {
        width: 32px;
      }
    }
  }
}
</style>
