import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { StatusBadge, type BadgeTone } from '../../components/ui/StatusBadge'
import {
  defaultArchiveRuntimeSettings,
  type ArchiveRuntimeMode,
  type ArchiveRuntimeSettings,
} from '../../services/archive'

const archiveModeLabels: Record<ArchiveRuntimeMode, string> = {
  local: '本机浏览器',
  http: '本地后端 HTTP',
}

type TestStatus = {
  tone: BadgeTone
  message: string
}

interface ArchiveRuntimeSettingsSectionProps {
  settings: ArchiveRuntimeSettings
  onChange: (update: Partial<ArchiveRuntimeSettings>) => void
}

export function ArchiveRuntimeSettingsSection({ settings, onChange }: ArchiveRuntimeSettingsSectionProps) {
  const [archiveStatus, setArchiveStatus] = useState<TestStatus | null>(null)

  function patch(update: Partial<ArchiveRuntimeSettings>) {
    onChange(update)
    setArchiveStatus(null)
  }

  async function testArchiveBackend() {
    const target = settings.baseUrl.trim() || defaultArchiveRuntimeSettings.baseUrl
    if (settings.mode === 'local') {
      setArchiveStatus({ tone: 'neutral', message: '当前使用本机浏览器，无需连接后端。' })
      return
    }
    try {
      const controller = new AbortController()
      const timeoutId = window.setTimeout(() => controller.abort(), settings.timeoutMs)
      try {
        const response = await fetch(`${target.replace(/\/$/, '')}/healthz`, { signal: controller.signal })
        setArchiveStatus(response.ok
          ? { tone: 'success', message: '本地后端可用。' }
          : { tone: 'warning', message: '后端未返回可用状态。' })
      } finally {
        window.clearTimeout(timeoutId)
      }
    } catch {
      setArchiveStatus({ tone: 'warning', message: '本地后端不可用；归档会保留本机备份。' })
    }
  }

  return (
    <section className="ai-settings-card ai-settings-card--archive" aria-labelledby="archive-runtime-title">
      <div className="ai-settings-card__heading">
        <span>归档</span>
        <h3 id="archive-runtime-title">存储位置</h3>
      </div>

      <div className="ai-settings-form-grid">
        <label>
          <span>保存位置</span>
          <select value={settings.mode} onChange={(event) => patch({ mode: event.target.value as ArchiveRuntimeMode })}>
            {(['local', 'http'] as const).map((mode) => (
              <option key={mode} value={mode}>{archiveModeLabels[mode]}</option>
            ))}
          </select>
        </label>

        <label>
          <span>后端地址</span>
          <input
            value={settings.baseUrl}
            onChange={(event) => patch({ baseUrl: event.target.value })}
            placeholder={defaultArchiveRuntimeSettings.baseUrl}
            autoComplete="url"
            disabled={settings.mode === 'local'}
          />
        </label>
      </div>

      <div className="ai-settings-archive-footer">
        <p className="ai-settings-note">默认使用本机浏览器；HTTP 失败时不重置当前局。</p>
        <div className="ai-settings-test-actions">
          <Button type="button" variant="secondary" onClick={testArchiveBackend}>测试后端</Button>
          {archiveStatus ? <StatusBadge tone={archiveStatus.tone}>{archiveStatus.message}</StatusBadge> : null}
        </div>
      </div>
    </section>
  )
}
