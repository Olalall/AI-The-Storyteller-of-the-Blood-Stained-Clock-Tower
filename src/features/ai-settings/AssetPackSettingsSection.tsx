import { Download, FileWarning, RefreshCw, ShieldCheck } from 'lucide-react'
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

  return (
    <section className="ai-settings-card ai-settings-card--assets" aria-labelledby="asset-pack-title">
      <div className="ai-settings-card__heading">
        <span><Download aria-hidden="true" />素材包</span>
        <h3 id="asset-pack-title">角色图标</h3>
      </div>

      <div className="asset-pack-summary">
        <div>
          <strong>{available}/{total}</strong>
          <span>本地图标</span>
        </div>
        <div>
          <strong>{projection.remoteIconCount}</strong>
          <span>未缓存外链</span>
        </div>
        <StatusBadge tone={copy.tone}>{copy.label}</StatusBadge>
      </div>

      <div className="asset-pack-footer">
        <p className="ai-settings-note"><FileWarning aria-hidden="true" />便捷包首次启动可安装官方及第三方角色图标。</p>
        <div className="ai-settings-test-actions">
          <Button type="button" variant="ghost" onClick={() => { void refresh() }}>
            <RefreshCw aria-hidden="true" />重新检测
          </Button>
          <Button type="button" variant="secondary" onClick={() => setGuideOpen(true)}>查看导入说明</Button>
        </div>
      </div>

      <Sheet
        open={guideOpen}
        onOpenChange={setGuideOpen}
        title="素材包"
        description="下载或导入前先确认来源、版权与用途。"
        presentation="page"
        layer="nested"
        contentClassName="sheet-content--asset-pack"
      >
        <div className="asset-pack-guide">
          <section className="asset-pack-guide__hero">
            <span><ShieldCheck aria-hidden="true" />需手动确认</span>
            <h3>角色图标素材包</h3>
            <p>素材来自 TPI Toolmaker Resources、GStone 与社区作者；确认后下载到本机，不进入 Git 仓库。</p>
            {available > 0 ? <img className="asset-pack-guide__ccc" src="/assets/community/ccc-sleeve.png" alt="Community Created Content" /> : null}
          </section>

          <section className="asset-pack-guide__grid" aria-label="素材包导入信息">
            <article>
              <span>放置目录</span>
              <strong>{projection.localDirectory}</strong>
            </article>
            <article>
              <span>来源记录</span>
              <strong>{projection.manifestPath}</strong>
            </article>
            <article>
              <span>当前缺口</span>
              <strong>{availability?.missing ?? 0} 个</strong>
            </article>
          </section>

          <ul className="asset-pack-guide__list">
            <li>便捷包首次启动会询问是否安装 718 个官方及第三方图标（约 102 MB）；拒绝后不会下载。</li>
            <li>不会把素材提交到公开仓库。</li>
            <li>以后可双击根目录 Install-Character-Assets.cmd 重新安装。</li>
          </ul>

          <label className="asset-pack-guide__ack">
            <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} />
            <span>我已了解来源与版权提示</span>
          </label>

          <footer className="asset-pack-guide__actions">
            <Button type="button" variant="secondary" disabled={!acknowledged} onClick={() => setGuideOpen(false)}>我已了解</Button>
            <Button type="button" variant="ghost" onClick={() => setGuideOpen(false)}>返回设置</Button>
          </footer>
        </div>
      </Sheet>
    </section>
  )
}
