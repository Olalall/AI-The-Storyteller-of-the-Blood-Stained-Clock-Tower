import { BookOpenText, Check, ChevronDown, PlayCircle, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { AISettingsSheet } from '../ai-settings/AISettingsSheet'
import { PWAInstallCard } from '../pwa/PWAInstallCard'
import { usePWAInstall } from '../pwa/pwaInstallContext'
import { HostingModeCard } from '../grimoire/mode/HostingModeCard'
import type { GameSessionState, HostingMode } from '../game-session/types'
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

/** 空对局入口：首次先处理安装建议，再选主持方式；回访时直接沿用上次选择。 */
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
  const { installed, promptAvailable, appleMobile } = usePWAInstall()
  const [installStepDone, setInstallStepDone] = useState(installIntroComplete || installed)
  const [selectedMode, setSelectedMode] = useState<HostingMode | undefined>(defaultHostingMode)
  const [editingMode, setEditingMode] = useState(firstRun || !defaultHostingMode)
  const [modeChoiceLocked, setModeChoiceLocked] = useState(false)
  const setupTitleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!installed || installStepDone) return
    setInstallStepDone(true)
    onCompleteInstallIntro()
  }, [installStepDone, installed, onCompleteInstallIntro])

  useEffect(() => {
    if (!modeChoiceLocked) return
    setupTitleRef.current?.focus({ preventScroll: true })
    const unlock = window.setTimeout(() => setModeChoiceLocked(false), 350)
    return () => window.clearTimeout(unlock)
  }, [modeChoiceLocked])

  useEffect(() => {
    if (firstRun || !defaultHostingMode) return
    setSelectedMode(defaultHostingMode)
    setEditingMode(false)
  }, [defaultHostingMode, firstRun])

  function completeInstallStep() {
    setModeChoiceLocked(true)
    setInstallStepDone(true)
    onCompleteInstallIntro()
  }

  function chooseMode(mode: HostingMode) {
    setSelectedMode(mode)
    if (!firstRun) setEditingMode(false)
  }

  return (
    <main className="session-entry" aria-label="开始新对局">
      <div className="session-entry__card">
        <div className="session-entry__topline">
          <span className="session-entry__eyebrow">血染钟楼 · 说书人辅助</span>
          <AISettingsSheet session={session} onImportSession={onImportSession} triggerLabel="打开设置与存档" />
        </div>

        {!installStepDone ? (
          <section className="session-entry__install-intro" aria-labelledby="install-intro-title">
            <span className="session-entry__step-label">首次使用 · 第 1 步</span>
            <h1 id="install-intro-title">安装到当前设备</h1>
            <p>安装后可从桌面直接打开，第一次完整加载后，核心主持功能支持离线。</p>
            <PWAInstallCard emphasized />
            <Button
              type="button"
              variant={promptAvailable ? 'ghost' : 'primary'}
              onClick={completeInstallStep}
            >
              {appleMobile ? '继续设置主持方式' : '暂不安装，先试用'}
            </Button>
            <small>安装不是开局条件，之后仍可在“应用设置”中找到安装入口。</small>
          </section>
        ) : (
          <section className="session-entry__setup-guide" aria-labelledby="session-entry-title">
            <span className="session-entry__step-label">{firstRun ? '首次使用 · 第 2 步' : '新对局'}</span>
            <h1 id="session-entry-title" ref={setupTitleRef} tabIndex={-1}>{firstRun ? '选择你的主持方式' : '开始一局新的主持'}</h1>
            <p>{firstRun
              ? '只决定屏幕上是否显示电子魔典，不会改变规则、记录或说书人的最终裁定。'
              : '已沿用上次的主持方式；确认无误后直接开始配板。'}</p>

            {editingMode ? (
              <>
                <HostingModeCard
                  value={selectedMode}
                  onSelect={chooseMode}
                  embedded
                  disabled={modeChoiceLocked}
                />
                <p className="session-entry__narrow-note" role="note">
                  手机窄屏会把电子魔典排成列表；换到平板或横屏宽视图时会自动恢复座位环。
                </p>
              </>
            ) : selectedMode ? (
              <div className="session-entry__mode-summary" aria-label="当前主持方式">
                <Check aria-hidden="true" />
                <span><small>当前主持方式</small><strong>{modeNames[selectedMode]}</strong></span>
                <Button type="button" variant="ghost" compact onClick={() => setEditingMode(true)}>更改</Button>
              </div>
            ) : null}

            <div className="session-entry__launch">
              {firstRun ? <span className="session-entry__step-label">第 3 步</span> : null}
              <h2>开始配板</h2>
              <p>{selectedMode ? '下一页选择板子、人数和玩家昵称。' : '先选择上面的主持方式，才能进入配板。'}</p>
              <div className="session-entry__actions">
                <Button variant="primary" disabled={!selectedMode} onClick={() => selectedMode && onStartSetup(selectedMode)}>
                  <PlayCircle aria-hidden="true" />开始配板
                </Button>
                <Button variant="ghost" disabled={!selectedMode || modeChoiceLocked} onClick={() => selectedMode && onOpenScriptLibrary(selectedMode)}>
                  <BookOpenText aria-hidden="true" />先浏览板子
                </Button>
              </div>
            </div>

            <details className="session-entry__help">
              <summary><ChevronDown aria-hidden="true" />第一次使用？查看完整流程和示例</summary>
              <ol aria-label="完整主持流程">
                <li><strong>配板并发送身份</strong><span>AI 可选，只提供候选和风险提示</span></li>
                <li><strong>按夜序逐项确认</strong><span>每个结果都由说书人手动确认</span></li>
                <li><strong>记录投票并复盘</strong><span>重要对局可从设置里导出备份</span></li>
              </ol>
              <button
                type="button"
                className="session-entry__demo"
                disabled={!selectedMode}
                onClick={() => selectedMode && onLoadDemo(selectedMode)}
              >
                <Sparkles aria-hidden="true" />载入示例对局（12人瓦釜雷鸣，进行到第3夜）
              </button>
            </details>
          </section>
        )}
      </div>
    </main>
  )
}
