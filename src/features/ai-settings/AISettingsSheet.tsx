import { Check, FlaskConical, KeyRound, PlugZap, RefreshCw, RotateCcw, Save, Settings, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { StatusBadge, type BadgeTone } from '../../components/ui/StatusBadge'
import {
  readArchiveRuntimeSettings,
  resetArchiveRuntimeSettings,
  saveArchiveRuntimeSettings,
  type ArchiveRuntimeSettings,
} from '../../services/archive'
import {
  defaultAISettings,
  readAISettings,
  resetAISettings,
  sanitizeAISettingsForSave,
  saveAISettings,
  type AISettings,
  type AIProviderMode,
} from '../../services/settings'
import { ArchiveRuntimeSettingsSection } from './ArchiveRuntimeSettingsSection'
import { AssetPackSettingsSection } from './AssetPackSettingsSection'
import { readBackendAIStatus, testBackendAIConnection, testLiveAIConnection } from './backendAIStatus'
import './ai-settings.css'

const modeLabels: Record<AIProviderMode, string> = {
  off: '关闭',
  backend: '后端代理',
  'openai-compatible': '兼容接口',
}

const modeDescriptions: Record<AIProviderMode, string> = {
  off: '只用本地原型',
  backend: '推荐，密钥在后端',
  'openai-compatible': 'OpenAI 兼容地址',
}

type TestStatus = {
  tone: BadgeTone
  message: string
}

function providerTone(mode: AIProviderMode): BadgeTone {
  return mode === 'off' ? 'neutral' : 'warning'
}

export function AISettingsSheet() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<AISettings>(() => readAISettings())
  const [archiveSettings, setArchiveSettings] = useState<ArchiveRuntimeSettings>(() => readArchiveRuntimeSettings())
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [testStatus, setTestStatus] = useState<TestStatus | null>(null)
  const [backendStatus, setBackendStatus] = useState<TestStatus | null>(null)

  useEffect(() => {
    if (!open) return
    setSettings(readAISettings())
    setArchiveSettings(readArchiveRuntimeSettings())
    setApiKey('')
    setSaved(false)
    setTestStatus(null)
    setBackendStatus(null)
  }, [open])

  useEffect(() => {
    if (!open) return
    if (archiveSettings.mode !== 'http') {
      setBackendStatus({ tone: 'neutral', message: '本机模式：AI复盘使用本地草稿。' })
      return
    }

    let active = true
    readBackendAIStatus(archiveSettings).then((status) => {
      if (active) setBackendStatus(status)
    })
    return () => {
      active = false
    }
  }, [archiveSettings, open])

  function patch(update: Partial<AISettings>) {
    setSettings((current) => ({ ...current, ...update }))
    setSaved(false)
    setTestStatus(null)
  }

  function patchArchive(update: Partial<ArchiveRuntimeSettings>) {
    setArchiveSettings((current) => ({ ...current, ...update }))
    setSaved(false)
  }

  async function refreshBackendStatus(nextSettings = archiveSettings) {
    if (nextSettings.mode !== 'http') {
      setBackendStatus({ tone: 'neutral', message: '本机模式：AI 使用本地草稿。' })
      return
    }
    setBackendStatus({ tone: 'neutral', message: '正在读取后端 AI 状态…' })
    setBackendStatus(await readBackendAIStatus(nextSettings))
  }

  async function testBackendConnection() {
    setTestStatus(await testBackendAIConnection(archiveSettings))
  }

  function validateConfig() {
    if (settings.mode === 'backend') {
      void testBackendConnection()
      return
    }
    if (settings.mode === 'off') {
      setTestStatus({ tone: 'neutral', message: '当前关闭，无需测试。' })
      return
    }
    if (!settings.baseUrl.trim() || !settings.model.trim()) {
      setTestStatus({ tone: 'warning', message: '请先填写接入地址和模型名字。' })
      return
    }
    if (!apiKey.trim()) {
      setTestStatus({ tone: 'warning', message: '缺少 API KEY；保存不会保存密钥。' })
      return
    }
    setTestStatus({ tone: 'success', message: '本页配置完整；API KEY 不会保存。' })
  }

  async function liveTestConnection() {
    setTestStatus(await testLiveAIConnection(archiveSettings, settings, apiKey))
  }

  function save() {
    saveAISettings(sanitizeAISettingsForSave(settings))
    saveArchiveRuntimeSettings(archiveSettings)
    const nextArchiveSettings = readArchiveRuntimeSettings()
    setArchiveSettings(nextArchiveSettings)
    setSettings(readAISettings())
    setSaved(true)
    setTestStatus((current) => current ?? { tone: 'neutral', message: '已保存非敏感设置。' })
    void refreshBackendStatus(nextArchiveSettings)
  }

  function reset() {
    const next = resetAISettings()
    const nextArchive = resetArchiveRuntimeSettings()
    setSettings(next)
    setArchiveSettings(nextArchive)
    setApiKey('')
    setSaved(true)
    setTestStatus({ tone: 'neutral', message: '已恢复默认。' })
  }

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title="AI API 设置"
      description="配置模型和接入地址；API KEY 只用于本次测试，不写入本地存储。"
      presentation="page"
      contentClassName="sheet-content--ai-settings"
      trigger={
        <button type="button" className="dashboard__settings-trigger" aria-label="打开AI API设置">
          <Settings aria-hidden="true" />
        </button>
      }
    >
      <form className="ai-settings-panel" onSubmit={(event) => { event.preventDefault(); save() }}>
        <section className="ai-settings-connection" aria-labelledby="ai-connection-title">
          <div className="ai-settings-connection__head">
            <span><PlugZap aria-hidden="true" />连接配置</span>
            <h3 id="ai-connection-title">AI API</h3>
          </div>
          <StatusBadge tone={providerTone(settings.mode)}>{settings.mode === 'off' ? '未启用' : '待接入'}</StatusBadge>
        </section>

        <section className="ai-settings-card ai-settings-card--form" aria-labelledby="ai-form-title">
          <div className="ai-settings-card__heading">
            <span>参数</span>
            <h3 id="ai-form-title">运行配置</h3>
          </div>

          <div className="ai-settings-form-grid">
            <label>
              <span>调用方式</span>
              <select
                value={settings.mode}
                onChange={(event) => patch({ mode: event.target.value as AIProviderMode })}
                aria-describedby="ai-mode-note"
              >
                {(['off', 'backend', 'openai-compatible'] as const).map((mode) => (
                  <option key={mode} value={mode}>{modeLabels[mode]} · {modeDescriptions[mode]}</option>
                ))}
              </select>
            </label>

            <label>
              <span>接入地址</span>
              <input
                value={settings.baseUrl}
                onChange={(event) => patch({ baseUrl: event.target.value })}
                placeholder="https://api.example.com/v1"
                autoComplete="url"
              />
            </label>

            <label>
              <span>模型名字</span>
              <input
                value={settings.model}
                onChange={(event) => patch({ model: event.target.value })}
                placeholder={defaultAISettings.model}
                autoComplete="off"
              />
            </label>

            <label>
              <span>API KEY</span>
              <input
                type="password"
                value={apiKey}
                onChange={(event) => { setApiKey(event.target.value); setSaved(false); setTestStatus(null) }}
                placeholder="sk-..."
                autoComplete="new-password"
              />
            </label>
          </div>

          <p id="ai-mode-note" className="ai-settings-note"><KeyRound aria-hidden="true" />API KEY 不保存；后续由本机或 VPS 后端接管密钥。</p>

          <div className="ai-settings-advanced" aria-label="高级参数">
            <label>
              <span>超时秒数</span>
              <input
                type="number"
                min="5"
                max="120"
                value={settings.timeoutSeconds}
                onChange={(event) => patch({ timeoutSeconds: Number(event.target.value) })}
              />
            </label>
            <label>
              <span>上下文上限</span>
              <input
                type="number"
                min="2000"
                max="128000"
                step="1000"
                value={settings.maxContextTokens}
                onChange={(event) => patch({ maxContextTokens: Number(event.target.value) })}
              />
            </label>
            <label className="ai-settings-toggle">
              <input type="checkbox" checked={settings.streaming} onChange={(event) => patch({ streaming: event.target.checked })} />
              <span>流式返回</span>
            </label>
          </div>
        </section>

        <ArchiveRuntimeSettingsSection settings={archiveSettings} onChange={patchArchive} />
        <AssetPackSettingsSection />

        <section className="ai-settings-card ai-settings-card--test" aria-labelledby="ai-test-title">
          <div className="ai-settings-test-copy">
            <span><ShieldCheck aria-hidden="true" />安全边界</span>
            <h3 id="ai-test-title">测试与保存</h3>
            <p>后端重启、VPS 改环境变量或端口变化后，先刷新状态；真实连通测试会发起一次后端代理请求。</p>
            {backendStatus ? <StatusBadge tone={backendStatus.tone}>{backendStatus.message}</StatusBadge> : null}
          </div>
          <div className="ai-settings-test-actions">
            <Button type="button" variant="ghost" onClick={() => { void refreshBackendStatus() }}><RefreshCw aria-hidden="true" />刷新状态</Button>
            <Button type="button" variant="secondary" onClick={validateConfig}><ShieldCheck aria-hidden="true" />校验配置</Button>
            <Button type="button" variant="secondary" onClick={liveTestConnection}><FlaskConical aria-hidden="true" />真实连通测试</Button>
            {testStatus ? <StatusBadge tone={testStatus.tone}>{testStatus.message}</StatusBadge> : null}
            {saved ? <p className="ai-settings-saved" role="status"><Check aria-hidden="true" />已保存设置</p> : null}
          </div>
        </section>

        <footer className="ai-settings-actions">
          <Button type="button" variant="ghost" onClick={reset}><RotateCcw aria-hidden="true" />恢复默认</Button>
          <Button type="submit" variant="primary"><Save aria-hidden="true" />保存设置</Button>
        </footer>
      </form>
    </Sheet>
  )
}
