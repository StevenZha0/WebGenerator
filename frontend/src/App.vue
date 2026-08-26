<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'
import { techTheme } from '@/styles/theme'
</script>

<template>
  <a-config-provider :theme="techTheme">
    <BasicLayout />
  </a-config-provider>
</template>

<style>
#app {
  min-height: 100vh;
  color: var(--tech-text);
  background:
    radial-gradient(circle at 12% 8%, rgba(6, 182, 212, 0.09), transparent 28rem),
    radial-gradient(circle at 88% 4%, rgba(20, 120, 255, 0.08), transparent 30rem),
    var(--tech-bg);
}

/* 全局样式优化 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family:
    'Inter', 'HarmonyOS Sans SC', 'Microsoft YaHei UI', -apple-system, BlinkMacSystemFont,
    'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

html {
  overflow-x: hidden;
}
</style>
