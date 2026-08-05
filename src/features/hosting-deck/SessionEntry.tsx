import { BookOpenText, PlayCircle, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { HostingModeCard } from '../grimoire/mode/HostingModeCard'
import type { HostingMode } from '../game-session/types'
import './session-entry.css'

interface SessionEntryProps {
  onStartSetup: () => void
  onOpenScriptLibrary: () => void
  onLoadDemo: () => void
  hostingMode?: HostingMode
  onSelectHostingMode: (mode: HostingMode) => void
  /** 逻辑宽度画不下座位环的设备，引导卡上补一句说明。 */
  narrowScreen?: boolean
}

/**
 * 空对局时的入口界面。
 *
 * 此前首次打开会直接落进一局开发夹具（12人瓦釜雷鸣、冻结在第3夜、预填记录），
 * 新用户会以为工具里已经有一局在进行。现在默认是空对局，由这里显式开始。
 */
export function SessionEntry({
  onStartSetup,
  onOpenScriptLibrary,
  onLoadDemo,
  hostingMode,
  onSelectHostingMode,
  narrowScreen = false,
}: SessionEntryProps) {
  return (
    <main className="session-entry" aria-label="开始新对局">
      <div className="session-entry__card">
        <span className="session-entry__eyebrow">血染钟楼 · 说书人辅助</span>
        <h1>开始一局新的主持</h1>
        <p>先选板子和人数，配好板之后进入黄昏。工具只做记录与建议，所有裁定仍由你确认。</p>
        <div className="session-entry__actions">
          <Button variant="primary" onClick={onStartSetup}><PlayCircle aria-hidden="true" />开始配板</Button>
          <Button variant="secondary" onClick={onOpenScriptLibrary}><BookOpenText aria-hidden="true" />浏览板子</Button>
        </div>
        <button type="button" className="session-entry__demo" onClick={onLoadDemo}>
          <Sparkles aria-hidden="true" />载入示例对局（12人瓦釜雷鸣，进行到第3夜）
        </button>
      </div>
      <HostingModeCard value={hostingMode} onSelect={onSelectHostingMode} narrow={narrowScreen} />
    </main>
  )
}
