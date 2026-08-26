<template>
  <a-modal v-model:open="visible" title="部署成功" :footer="null" width="600px">
    <div class="deploy-success">
      <div class="success-icon">
        <CheckCircleOutlined style="color: #52c41a; font-size: 48px" />
      </div>
      <h3>网站部署成功！</h3>
      <p>你的网站已经成功部署，可以通过以下链接访问：</p>
      <div class="deploy-url">
        <a-input :value="deployUrl" readonly>
          <template #suffix>
            <a-button type="text" @click="handleCopyUrl">
              <CopyOutlined />
            </a-button>
          </template>
        </a-input>
      </div>
      <div class="deploy-actions">
        <a-button type="primary" @click="handleOpenSite">访问网站</a-button>
        <a-button @click="handleClose">关闭</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { message } from 'ant-design-vue'
import { CheckCircleOutlined, CopyOutlined } from '@ant-design/icons-vue'

interface Props {
  open: boolean
  deployUrl: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'open-site'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const handleCopyUrl = async () => {
  try {
    await navigator.clipboard.writeText(props.deployUrl)
    message.success('链接已复制到剪贴板')
  } catch (error) {
    console.error('复制失败：', error)
    message.error('复制失败')
  }
}

const handleOpenSite = () => {
  emit('open-site')
}

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.deploy-success {
  text-align: center;
  padding: 24px;
  border-radius: var(--tech-radius-lg);
  background:
    radial-gradient(circle at 50% 0, rgba(22, 160, 133, 0.1), transparent 44%),
    var(--tech-surface-solid);
}

.success-icon {
  margin-bottom: 16px;
  filter: drop-shadow(0 8px 18px rgba(22, 160, 133, 0.2));
}

.deploy-success h3 {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 600;
  color: var(--tech-text);
}

.deploy-success p {
  margin: 0 0 24px;
  color: var(--tech-text-secondary);
}

.deploy-url {
  margin-bottom: 24px;
}

.deploy-url :deep(.ant-input-affix-wrapper) {
  background: var(--tech-surface-muted);
  border-color: var(--tech-border);
}

.deploy-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
