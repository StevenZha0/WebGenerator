<template>
  <a-layout-footer class="footer">
    <div class="footer-content">
      <p class="copyright">
        <a
          href="https://www.codefather.cn"
          target="_blank"
          rel="noopener noreferrer"
          class="author-link"
        >
          编程导航原创项目 by 程序员鱼皮
        </a>
      </p>
    </div>
  </a-layout-footer>
</template>

<script setup lang="ts">
// 无需额外的响应式数据
</script>

<style scoped>
.footer {
  background: rgba(247, 250, 255, 0.9);
  backdrop-filter: blur(16px);
  text-align: center;
  padding: 20px;
  margin-top: 40px;
  border-top: 1px solid var(--tech-border);
}

.copyright {
  margin: 0;
  color: var(--tech-text-muted);
  font-size: 14px;
}

.author-link {
  color: inherit;
}

.author-link:hover {
  color: var(--tech-primary);
}
</style>
