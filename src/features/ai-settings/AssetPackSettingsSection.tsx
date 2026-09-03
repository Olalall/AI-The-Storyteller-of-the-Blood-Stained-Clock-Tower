import { Download, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { StatusBadge, type BadgeTone } from '../../components/ui/StatusBadge'
import { smartScriptPacks, type SmartScriptPack } from '../../domain/scripts'
import {
  checkCharacterAssetAvailability,
  projectCharacterAssetPack,
  type AssetAvailabilityStatus,
  type AssetFetch,
  type CharacterAssetAvailability,
} from '../../services/assets/assetPackService'
import installerUrl from '../../../scripts/portable/Install-CharacterAssets.ps1?url'

interface AssetPackSettingsSectionProps {
  packs?: readonly SmartScriptPack[]
  fetcher?: AssetFetch
}

const statusCopy: Record<AssetAvailabilityStatus, { tone: BadgeTone; label: string }> = {
  checking: { tone: 'neutral', label: '检测中' },
  ready: { tone: 'success', label: '已就绪' },
  missing: { tone: 'warning', label: '需导入' },
  unknown: { tone: 'neutral', label: '未检测' },
}

export function AssetPackSettingsSection({
  packs = smartScriptPacks,
  fetcher,
}: AssetPackSettingsSectionProps) {
  const [guideOpen, setGuideOpen] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [availability, setAvailability] = useState<CharacterAssetAvailability | null>(null)
  const [status, setStatus] = useState<AssetAvailabilityStatus>('checking')
  const projection = useMemo(() => projectCharacterAssetPack(packs), [packs])

  async function refresh() {
    setStatus('checking')
    const next = await checkCharacterAssetAvailability(projection.requirements, fetcher)
    setAvailability(next)
    setStatus(next.status)
  }

  useEffect(() => {
    let active = true
    setStatus('checking')
    checkCharacterAssetAvailability(projection.requirements, fetcher).then((next) => {
      if (!active) return
      setAvailability(next)
      setStatus(next.status)
    })
    return () => {
      active = false
    }
  }, [fetcher, projection])

  const copy = statusCopy[status]
  const available = availability?.available ?? 0
  const total = projection.requirements.length

  function downloadInstaller() {
    const link = document.createElement('a')
    link.href = installerUrl
    link.download = 'Install-CharacterAssets.ps1'
    document.body.append(link)
    link.click()
    link.remove()
    setDownloaded(true)
  }

  return (
    <section className="ai-settings-card ai-settings-card--assets" aria-labelledby="asset-pack-title">
      <div className="ai-settings-card__heading">
        <span><Download aria-hidden="true" />素材包</span>
        <h3 id="asset-pack-title">角色图标</h3>
      </div>

      <div className="asset-pack-summary">
        <div>
          <strong>{available}/{total}</strong>
          <span>{status === 'checking' ? '正在检测角色图标' : availability?.missing ? `缺少 ${availability.missing} 个图标` : '角色图标完整'}</span>
        </div>
        <StatusBadge tone={copy.tone}>{copy.label}</StatusBadge>
        <div className="ai-settings-test-actions">
          <Button type="button" variant="ghost" onClick={() => { void refresh() }}>
            <RefreshCw aria-hidden="true" />重新检测
          </Button>
          <Button type="button" variant="secondary" onClick={() => setGuideOpen(true)}>安装说明</Button>
        </div>
      </div>

      <Sheet
        open={guideOpen}
        onOpenChange={setGuideOpen}
        title="素材包"
        description="安装角色图标"
        layer="nested"
        contentClassName="sheet-content--asset-pack"
      >
        <div className="asset-pack-guide">
          <section className="asset-pack-guide__summary">
            <strong>{available}/{total}</strong>
            <div><h3>{availability?.missing ? `还需安装 ${availability.missing} 个图标` : '角色图标已经完整'}</h3><p>素材来自 TPI、GStone 与社区作者，安装器会逐个校验文件。</p></div>
          </section>

          <p className="asset-pack-guide__hint">下载约 102 MB。请把安装器放回软件的 scripts/portable 目录后运行。</p>

          <label className="asset-pack-guide__ack">
            <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} />
            <span>我接受素材来源与使用提示</span>
          </label>

          <footer className="asset-pack-guide__actions">
            <Button type="button" variant="primary" disabled={!acknowledged} onClick={downloadInstaller}><Download aria-hidden="true" />下载素材安装器</Button>
            {downloaded ? <span role="status">安装器已下载</span> : null}
          </footer>
        </div>
      </Sheet>
    </section>
  )
}
