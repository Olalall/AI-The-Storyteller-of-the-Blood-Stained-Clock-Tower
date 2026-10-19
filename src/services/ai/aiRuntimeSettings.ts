import { readArchiveRuntimeSettings, type ArchiveRuntimeSettings } from '../archive/archiveRuntimeSettings'

export type AIRuntimeSettings = ArchiveRuntimeSettings

const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]'])

// 公网站点的付费 AI 和设备授权始终请求本站；归档的位置不决定 AI 或口令的接收方。
// 本机开发保留已有 local/http 配置，便于离线使用及连接单独运行的开发后端。
export function readAIRuntimeSettings(pageUrl = window.location.href): AIRuntimeSettings {
  const legacy = readArchiveRuntimeSettings()
  const page = new URL(pageUrl)
  if ((page.protocol === 'http:' || page.protocol === 'https:') && !loopbackHosts.has(page.hostname)) {
    return { mode: 'http', baseUrl: page.origin, timeoutMs: legacy.timeoutMs }
  }
  return legacy
}
