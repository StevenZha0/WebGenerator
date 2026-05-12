<script setup lang="ts">
import { RouterView } from 'vue-router'
import GlobalFooter from '@/components/GlobalFooter.vue'
import GlobalHeader from '@/components/GlobalHeader.vue'
</script>

<template>
  <a-layout class="basic-layout">
    <a-layout-header class="basic-layout__header">
      <GlobalHeader />
    </a-layout-header>
    <a-layout-content class="basic-layout__content">
      <RouterView />
    </a-layout-content>
    <a-layout-footer class="basic-layout__footer">
      <GlobalFooter />
    </a-layout-footer>
  </a-layout>
</template>

<style scoped>
.basic-layout {
  min-height: 100vh;
}

.basic-layout__header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding-inline: 0;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.basic-layout__content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px;
}

.basic-layout__footer {
  margin-top: auto;
  padding: 16px;
  text-align: center;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .basic-layout__content {
    padding: 16px 12px;
  }
}
</style>
