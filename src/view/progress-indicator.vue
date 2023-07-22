<template>
  <aside class="progress-indicator">
    <div class="-eye" />
  </aside>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.progress-indicator {
  background-color: transparent;
  height: 2px;
  width: 100%;
  overflow: hidden;
  position: fixed;
  top: 0;
  display: block;

  & > .-eye {
    background-image: linear-gradient(
      to right,
      #b307f700 15%,
      #00ff00ff 50%,
      #b307f700 85%
    );
    color: transparent;
    height: 100%;
    width: 20%;
    animation: wt-scanning-eye-animation 1s linear infinite alternate,
      wt-scanning-eye-animation-blink 1.25s linear infinite alternate;
  }

  @keyframes wt-scanning-eye-animation {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(500%);
    }
  }

  @keyframes wt-scanning-eye-animation-blink {
    0% {
      filter: hue-rotate(0deg);
    }
    80% {
      filter: hue-rotate(0deg);
    }
    100% {
      filter: hue-rotate(360deg);
    }
  }
}
</style>
