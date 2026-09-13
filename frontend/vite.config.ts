import { fileURLToPath, URL } from 'node:url'
import net from 'node:net'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

/**
 * 后端候选地址，按优先级从上到下探测，命中第一个存活的就用它。
 *
 * - gateway  : Higress 网关（docker all-in-one，0.0.0.0:8080），转发到 8124/8125 等微服务
 * - monolith : 单体后端（src/ 下的 Spring Boot，8123）
 *
 * 通过环境变量 VITE_PROXY_TARGET 可以跳过探测、强制指定：
 *   VITE_PROXY_TARGET=8123 npm run dev
 */
const PROXY_CANDIDATES = [
  { name: 'gateway（Higress 网关）', target: 'http://127.0.0.1:8080' },
  { name: 'monolith（单体后端）', target: 'http://127.0.0.1:8123' },
]

/** TCP 探测端口上是否有服务在监听；只判断“活着”，不发任何 HTTP 请求。 */
function isPortAlive(host: string, port: number, timeout = 800): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port })
    let done = false
    const finish = (alive: boolean) => {
      if (done) return
      done = true
      socket.destroy()
      resolve(alive)
    }
    socket.setTimeout(timeout)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })
}

/** 依次探测候选地址，返回第一个存活的；都没起则返回 null。 */
async function detectProxyTarget() {
  for (const candidate of PROXY_CANDIDATES) {
    const { hostname, port } = new URL(candidate.target)
    if (await isPortAlive(hostname, Number(port))) {
      return candidate
    }
  }
  return null
}

export default defineConfig(async () => {
  // 强制指定时不做探测
  const forced = process.env.VITE_PROXY_TARGET?.trim()

  let target: string
  let summary: string

  if (forced) {
    target = forced.startsWith('http') ? forced : `http://127.0.0.1:${forced}`
    summary = `已通过 VITE_PROXY_TARGET 强制指定：/api -> ${target}`
  } else {
    const picked = await detectProxyTarget()
    if (picked) {
      target = picked.target
      summary = `/api -> ${target}  ${picked.name}`
    } else {
      // 一个都没起，仍然按最高优先级配置，让 Vite 的 proxy error 如实暴露连接失败
      target = PROXY_CANDIDATES[0].target
      summary =
        `/api -> ${target}（兜底，后端当前未启动）\n` +
        `  提示：候选地址 ${PROXY_CANDIDATES.map((c) => c.target).join(' / ')} 都没监听，` +
        `先启动 Higress 网关或单体后端`
    }
  }

  console.log(`\n  [proxy] ${summary}\n`)

  // 网关按 Host 头做路由，必须保留 localhost:8080，
  // 否则上游服务生成的 Session Cookie 域也会不对，导致登录态丢失
  const isGateway = target.includes(':8080')

  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target,
          // 单体后端靠 @CrossOrigin 放行跨域，需要改写 Origin，
          // 网关走同源路由，保留原始 Host
          changeOrigin: !isGateway,
          secure: false,
        },
      },
    },
  }
})
