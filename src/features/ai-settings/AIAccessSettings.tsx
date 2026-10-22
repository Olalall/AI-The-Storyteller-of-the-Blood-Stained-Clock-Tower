import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import type { AIRuntimeSettings } from '../../services/ai/aiRuntimeSettings'
import { setBackendAIAccess, type BackendAIStatus } from './backendAIStatus'

export function AIAccessSettings({ runtime, authorized, onChanged, compact = false }: {
  runtime: AIRuntimeSettings
  authorized: boolean
  onChanged: () => Promise<void>
  compact?: boolean
}) {
  const [passcode, setPasscode] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<BackendAIStatus | null>(null)
  async function submit(event?: FormEvent) {
    event?.preventDefault()
    if (busy || (!authorized && !passcode.trim())) return
    setBusy(true)
    const response = await setBackendAIAccess(runtime, authorized ? undefined : passcode.trim())
    setPasscode('')
    setResult(response)
    if (response.tone === 'success') await onChanged()
    setBusy(false)
  }
  return (
    <section className={`ai-settings-card${compact ? ' ai-settings-card--compact' : ''}`} aria-label="AI 访问保护">
      {!compact ? <><div className="ai-settings-card__heading"><h3>AI 访问保护</h3></div><p className="ai-settings-note">{authorized ? '此设备已验证。API 密钥由服务器保存，重新打开网站不需要填写。' : '仅你和受邀的人可使用真实 AI。首次输入访问口令，验证后记住此设备 30 天。'}</p></> : null}
      {authorized ? (
        <Button type="button" variant="ghost" disabled={busy} onClick={() => { void submit() }}>取消此设备授权</Button>
      ) : (
        <form className="ai-settings-access-form" onSubmit={(event) => { void submit(event) }}>
          <Field label="AI 访问口令" hint={compact ? '向站主获取邀请口令，验证后记住设备30天。' : '这是站点邀请口令，不是 API 密钥。由站主从私有配置中获取。'}>
            <input aria-label="AI 访问口令" type="password" autoComplete="current-password" value={passcode} maxLength={256} disabled={busy} onChange={(event) => setPasscode(event.target.value)} />
          </Field>
          <Button type="submit" disabled={busy || !passcode.trim()}>验证并记住此设备</Button>
        </form>
      )}
      {result ? <p className="ai-settings-note" role="status">{result.message}</p> : null}
    </section>
  )
}
