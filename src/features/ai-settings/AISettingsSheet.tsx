import { FlaskConical, PlugZap, RefreshCw, Settings, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { readAIRuntimeSettings } from '../../services/ai/aiRuntimeSettings'
import { AssetPackSettingsSection } from './AssetPackSettingsSection'
import { AIAccessSettings } from './AIAccessSettings'
import { readBackendAIStatus, testBackendAIConnection, testLiveAIConnection, type BackendAIStatus } from './backendAIStatus'
import type { GameSessionState } from '../game-session/types'
import { SessionBackupSection } from './SessionBackupSection'
import { PWAInstallCard } from '../pwa/PWAInstallCard'
import './ai-settings.css'

interface AISettingsSheetProps {
  session?: GameSessionState
  onImportSession?: (session: GameSessionState) => void
  triggerLabel?: string
}

export function AISettingsSheet({ session, onImportSession, triggerLabel }: AISettingsSheetProps = {}) {
  const [open, setOpen] = useState(false)
  const [runtime, setRuntime] = useState(readAIRuntimeSettings)
  const [backendStatus, setBackendStatus] = useState<BackendAIStatus | null>(null)
  const [testStatus, setTestStatus] = useState<BackendAIStatus | null>(null)
  const [liveAcknowledged, setLiveAcknowledged] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    const currentRuntime = readAIRuntimeSettings()
    setRuntime(currentRuntime)
    setBackendStatus(null)
    setTestStatus(null)
    setLiveAcknowledged(false)
    let active = true
    readBackendAIStatus(currentRuntime).then((status) => {
      if (active) setBackendStatus(status)
    })
    return () => { active = false }
  }, [open])

  async function refreshBackendStatus() {
    setBusy(true)
    setTestStatus(null)
    setLiveAcknowledged(false)
    setBackendStatus(await readBackendAIStatus(runtime))
    setBusy(false)
  }

  async function testConnection(live: boolean) {
    if (live && (!liveAcknowledged || backendStatus?.state !== 'ready')) return
    setBusy(true)
    setTestStatus({ tone: 'neutral', message: live ? '正在请求真实模型…' : '正在检查后端配置…' })
    setTestStatus(await (live ? testLiveAIConnection(runtime) : testBackendAIConnection(runtime)))
    if (live) setLiveAcknowledged(false)
    setBusy(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title="AI API 设置"
      description="查看实际配置与素材"
      presentation="page"
      contentClassName="sheet-content--ai-settings"
      trigger={
        <button type="button" className="dashboard__settings-trigger" aria-label={triggerLabel ?? "打开AI API设置"}>
          <Settings aria-hidden="true" />{triggerLabel ? <span>{triggerLabel}</span> : null}
        </button>
      }
    >
      <div className="ai-settings-panel">
        <section className="ai-settings-connection" aria-labelledby="ai-connection-title">
          <div className="ai-settings-connection__head">
            <span><PlugZap aria-hidden="true" />当前调用方式</span>
            <h3 id="ai-connection-title">{runtime.mode === 'http' ? '后端代理' : '本地候选'}</h3>
          </div>
          <StatusBadge tone={backendStatus?.tone ?? 'neutral'}>{backendStatus?.label ?? '正在读取状态'}</StatusBadge>
        </section>

        <section className="ai-settings-card" aria-labelledby="ai-form-title">
          <div className="ai-settings-card__heading">
            <span>实际生效配置</span>
            <h3 id="ai-form-title">{backendStatus ? backendStatus.model ?? (backendStatus.state === 'unavailable' ? '暂时无法确认模型' : '当前未使用模型') : '正在读取模型配置'}</h3>
          </div>
          <p className="ai-settings-note" role="status">{backendStatus?.message ?? '正在读取当前页面使用的 AI 配置…'}</p>
          {backendStatus?.model ? (
            <dl className="ai-settings-effective-config">
              <div><dt>后端请求超时</dt><dd>{backendStatus.timeoutSeconds ? `${backendStatus.timeoutSeconds} 秒` : '未提供'}</dd></div>
              <div><dt>后端上下文上限</dt><dd>{backendStatus.contextLimit ? `${backendStatus.contextLimit} tokens` : '未提供'}</dd></div>
            </dl>
          ) : null}
          <p className="ai-settings-note">模型、密钥和调用参数由服务器管理，本页只显示当前配置。配板和夜间推荐调用失败时会退回本地候选，仍需说书人确认。</p>

          <div className="ai-settings-test-actions">
            <Button type="button" variant="ghost" disabled={busy} onClick={() => { void refreshBackendStatus() }}><RefreshCw aria-hidden="true" />刷新状态</Button>
            <Button type="button" variant="secondary" disabled={busy} onClick={() => { void testConnection(false) }}><ShieldCheck aria-hidden="true" />检查配置（不调用模型）</Button>
          </div>

          {backendStatus?.state === 'ready' ? (
            <details className="ai-settings-advanced-panel">
              <summary>真实连通测试</summary>
              <p className="ai-settings-note">会向上方模型发送一次测试请求，可能产生 API 费用；不会发送当前对局。测试成功只代表模型可连接，不代表规则判断已通过验证。</p>
              <label className="ai-settings-live-ack">
                <input type="checkbox" checked={liveAcknowledged} disabled={busy} onChange={(event) => setLiveAcknowledged(event.target.checked)} />
                <span>我确认发起一次真实模型请求</span>
              </label>
              <Button type="button" variant="secondary" disabled={busy || !liveAcknowledged} onClick={() => { void testConnection(true) }}><FlaskConical aria-hidden="true" />测试当前模型</Button>
            </details>
          ) : null}
          {testStatus ? <p className="ai-settings-note" role="status"><StatusBadge tone={testStatus.tone}>{testStatus.message}</StatusBadge></p> : null}
        </section>

        {backendStatus?.accessRequired ? <AIAccessSettings runtime={runtime} authorized={backendStatus.accessAuthorized === true} onChanged={refreshBackendStatus} /> : null}
        {session && onImportSession ? <SessionBackupSection session={session} onImportSession={onImportSession} /> : null}
        <PWAInstallCard compact />
        <AssetPackSettingsSection />
      </div>
    </Sheet>
  )
}
