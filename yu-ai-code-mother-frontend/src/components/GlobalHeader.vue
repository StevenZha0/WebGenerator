<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logoPng from '@/assets/logo.png'

type MenuItem = {
  key: string
  label: string
}

const menuItems: MenuItem[] = [
  { key: '/', label: '首页' },
  { key: '/about', label: '关于' },
]

const route = useRoute()
const router = useRouter()
const logoSrc = ref(logoPng)

const selectedKey = computed(() => route.path)

const onMenuClick = ({ key }: { key: string }) => {
  if (key !== route.path) {
    void router.push(key)
  }
}
</script>

<template>
  <div class="global-header">
    <div class="global-header__brand">
      <img :src="logoSrc" alt="logo" class="global-header__logo" />
      <span class="global-header__title">编程导航</span>
    </div>

    <a-menu
      mode="horizontal"
      :items="menuItems"
      :selected-keys="[selectedKey]"
      class="global-header__menu"
      @click="onMenuClick"
    />

    <div class="global-header__user">
      <a-button type="primary">登录</a-button>
    </div>
  </div>
</template>

<style scoped>
.global-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  max-width: 1200px;
  min-height: 64px;
  margin: 0 auto;
  padding: 0 16px;
}

.global-header__brand {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
}

.global-header__logo {
  width: 32px;
  height: 32px;
  object-fit: cover;
}

.global-header__title {
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
  white-space: nowrap;
}

.global-header__menu {
  flex: 1 1 auto;
  min-width: 0;
  justify-content: center;
  border-bottom: none;
  background: transparent;
}

.global-header__user {
  flex: 0 0 auto;
}

@media (max-width: 768px) {
  .global-header {
    padding: 0 12px;
  }

  .global-header__title {
    display: none;
  }
}
</style>
