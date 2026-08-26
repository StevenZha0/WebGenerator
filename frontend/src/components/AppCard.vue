<template>
  <div class="app-card" :class="{ 'app-card--featured': featured }">
    <div class="app-preview">
      <img v-if="app.cover" :src="app.cover" :alt="app.appName" />
      <div v-else class="app-placeholder">
        <span>🤖</span>
      </div>
      <div class="app-overlay">
        <a-space>
          <a-button type="primary" @click="handleViewChat">查看对话</a-button>
          <a-button v-if="app.deployKey" type="default" @click="handleViewWork">查看作品</a-button>
        </a-space>
      </div>
    </div>
    <div class="app-info">
      <div class="app-info-left">
        <a-avatar :src="app.user?.userAvatar || DEFAULT_USER_AVATAR" :size="40" />
      </div>
      <div class="app-info-right">
        <h3 class="app-title">{{ app.appName || '未命名应用' }}</h3>
        <p class="app-author">
          {{
            app.user?.userName
              ? getUserDisplayName(app.user.userName)
              : featured
                ? 'NoCode 官方'
                : DEFAULT_USER_NAME
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DEFAULT_USER_AVATAR, DEFAULT_USER_NAME, getUserDisplayName } from '@/constants/user'

interface Props {
  app: API.AppVO
  featured?: boolean
}

interface Emits {
  (e: 'view-chat', appId: string | number | undefined): void
  (e: 'view-work', app: API.AppVO): void
}

const props = withDefaults(defineProps<Props>(), {
  featured: false,
})

const emit = defineEmits<Emits>()

const handleViewChat = () => {
  emit('view-chat', props.app.id)
}

const handleViewWork = () => {
  emit('view-work', props.app)
}
</script>

<style scoped>
.app-card {
  background: var(--tech-surface);
  border-radius: var(--tech-radius-lg);
  overflow: hidden;
  box-shadow: var(--tech-shadow-sm);
  backdrop-filter: blur(14px);
  border: 1px solid var(--tech-border);
  transition:
    transform var(--tech-transition),
    box-shadow var(--tech-transition),
    border-color var(--tech-transition);
  cursor: pointer;
}

.app-card:hover {
  transform: translateY(-4px);
  border-color: var(--tech-border-strong);
  box-shadow: var(--tech-shadow-glow);
}

.app-preview {
  height: 180px;
  background:
    linear-gradient(135deg, rgba(20, 120, 255, 0.07), rgba(6, 182, 212, 0.1)),
    var(--tech-surface-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.app-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-placeholder {
  font-size: 48px;
  color: var(--tech-text-muted);
  filter: saturate(0.65);
}

.app-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(8, 25, 48, 0.62);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--tech-transition);
}

.app-card:hover .app-overlay {
  opacity: 1;
}

.app-info {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid rgba(80, 112, 146, 0.08);
}

.app-info-left {
  flex-shrink: 0;
}

.app-info-right {
  flex: 1;
  min-width: 0;
}

.app-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--tech-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-author {
  font-size: 14px;
  color: var(--tech-text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
