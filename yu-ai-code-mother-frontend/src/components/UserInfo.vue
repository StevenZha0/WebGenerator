<template>
  <div class="user-info">
    <a-avatar :src="user?.userAvatar || DEFAULT_USER_AVATAR" :size="size" />
    <span v-if="showName" class="user-name">{{ getUserDisplayName(user?.userName) }}</span>
  </div>
</template>

<script setup lang="ts">
import { DEFAULT_USER_AVATAR, getUserDisplayName } from '@/constants/user'

interface Props {
  user?: API.UserVO
  size?: number | 'small' | 'default' | 'large'
  showName?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'default',
  showName: true,
})
</script>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 14px;
  color: #1a1a1a;
}
</style>
