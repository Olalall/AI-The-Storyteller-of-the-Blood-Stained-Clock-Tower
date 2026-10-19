import { BookOpenText, Check, ChevronDown, PlayCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { AISettingsSheet } from '../ai-settings/AISettingsSheet'
import { PWAInstallCard } from '../pwa/PWAInstallCard'
import { usePWAInstall } from '../pwa/pwaInstallContext'
import { HostingModeCard } from '../grimoire/mode/HostingModeCard'
import type { GameSessionState, HostingMode } from '../game-session/types'
import { NewUserGuideSheet } from './NewUserGuideSheet'
import './session-entry.css'

interface SessionEntryProps {
  session: GameSessionState
  onImportSession: (session: GameSessionState) => void
  installIntroComplete: boolean
  firstRun: boolean
  defaultHostingMode?: HostingMode
  onCompleteInstallIntro: () => void
  onStartSetup: (mode: HostingMode) => void
  onOpenScriptLibrary: (mode: HostingMode) => void
  onLoadDemo: (mode: HostingMode) => void
}

const modeNames: Record<HostingMode, string> = {
  record: '实体魔典 + 工具记录',
  grimoire: '电子魔典',
}

/** 空对局入口：首次先选主持方式，安装建议收进可选项；回访时直接沿用上次选择。 */
export function SessionEntry({
  session,
  onImportSession,
  installIntroComplete,
  firstRun,
  defaultHostingMode,
  onCompleteInstallIntro,
  onStartSetup,
  onOpenScriptLibrary,
  onLoadDemo,
}: SessionEntryProps) {
  const { installed } = usePWAInstall()
  const [installHelpDismissed, setInstallHelpDismissed] = useState(installIntroComplete || installed)
  const [selectedMode, setSelectedMode] = useState<HostingMode | undefined>(defaultHostingMode)
  const [editingMode, setEditingMode] = useState(firstRun || !defaultHostingMode)

  useEffect(() => {
    if (!installed || installHelpDismissed) return
    setInstallHelpDismissed(true)
    onCompleteInstallIntro()
  }, [installHelpDismissed, installed, onCompleteInstallIntro])

  useEffect(() => {
    if (firstRun || !defaultHostingMode) return
    setSelectedMode(defaultHostingMode)
    setEditingMode(false)
  }, [defaultHostingMode, firstRun])

  function completeInstallIntro() {
    if (installHelpDismissed) return
    setInstallHelpDismissed(true)
    onCompleteInstallIntro()
  }

  function chooseMode(mode: HostingMode) {
    setSelectedMode(mode)
    if (!firstRun) setEditingMode(false)
  }

  function startSetup() {
    if (!selectedMode) return
    completeInstallIntro()
    onStartSetup(selectedMode)
  }

  function openScriptLibrary() {
    if (!selectedMode) return
    completeInstallIntro()
    onOpenScriptLibrary(selectedMode)
  }

  function loadDemo() {
    if (!selectedMode) return
    completeInstallIntro()
    onLoadDemo(selectedMode)
  }

  return (
    <main className="session-entry" aria-label="开始新对局">
      <div className="session-entry__card">
        <div className="session-entry__topline">
          <span className="session-entry__eyebrow">血染钟楼 · 说书人辅助</span>
          <AISettingsSheet session={session} onImportSession={onImportSession} triggerLabel="打开设置与存档" />
        </div>

        <section className="session-entry__setup-guide" aria-labelledby="session-entry-title">
            <span className="session-entry__step-label">{firstRun ? '开局引导 · 第 1 / 4 步' : '新对局'}</span>
            <h1 id="session-entry-title">{firstRun ? '先选择主持方式' : '开始一局新的主持'}</h1>
            <p>{firstRun
              ? '只决定这台设备是否显示电子魔典；之后随时可以更改。'
              : '已沿用上次选择；确认后继续设置本局。'}</p>

            {editingMode ? (
              <>
                <HostingModeCard
                  value={selectedMode}
                  onSelect={chooseMode}
                  embedded
                />
              </>
            ) : selectedMode ? (
              <div className="session-entry__mode-summary" aria-label="当前主持方式">
                <Check aria-hidden="true" />
                <span><small>当前主持方式</small><strong>{modeNames[selectedMode]}</strong></span>
                <Button type="button" variant="ghost" compact onClick={() => setEditingMode(true)}>更改</Button>
              </div>
            ) : null}

            <div className="session-entry__launch">
              <span className="session-entry__step-label">下一步</span>
              <h2>设置板子、人数和玩家</h2>
              <p>{selectedMode ? '继续后仍不会发送身份，配板结果需要你再次确认。' : '先选择上面的主持方式。'}</p>
              <div className="session-entry__actions">
                <Button variant="primary" disabled={!selectedMode} onClick={startSetup}>
                  <PlayCircle aria-hidden="true" />继续：选择板子和人数
                </Button>
                <Button variant="ghost" disabled={!selectedMode} onClick={openScriptLibrary}>
                  <BookOpenText aria-hidden="true" />浏览全部板子
                </Button>
              </div>
            </div>

            <div className="session-entry__learning">
              <NewUserGuideSheet className="session-entry__guide-trigger" triggerLabel="新手教学 · 2分钟看懂一局" onLoadDemo={loadDemo} demoAvailable={Boolean(selectedMode)} />
              <p>以后也能从顶部阶段栏重新打开。</p>
            </div>

            {!installHelpDismissed ? <details className="session-entry__install-help">
              <summary><ChevronDown aria-hidden="true" />安装到主屏幕（可稍后）</summary>
              <PWAInstallCard compact />
              <Button type="button" variant="ghost" compact onClick={completeInstallIntro}>以后再说</Button>
            </details> : null}
          </section>
      </div>
    </main>
  )
}
