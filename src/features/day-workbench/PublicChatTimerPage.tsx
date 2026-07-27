import { ArrowLeft, Pause, Play, RotateCcw, SlidersHorizontal, Timer } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { DayTimerSettings } from './components/DayTimerSettings'
import { useDiscussionTimer } from './state/useDiscussionTimer'
import './day-workbench.css'

const stageLabels = { private: '私聊', public: '公聊' } as const

interface PublicChatTimerPageProps {
  onExit: () => void
}

export function PublicChatTimerPage({ onExit }: PublicChatTimerPageProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const timer = useDiscussionTimer()
  const stageLabel = stageLabels[timer.activeStage]
  const actionLabel = timer.isRunning ? `暂停${stageLabel}` : `开始${stageLabel}`

  return (
    <main className="public-timer-page" aria-label="公聊倒计时">
      <header className="public-timer-page__header">
        <Button variant="ghost" compact onClick={onExit}><ArrowLeft aria-hidden="true" /><span>返回本局</span></Button>
        <span><Timer aria-hidden="true" />公聊倒计时</span>
      </header>
      <section className="public-timer-focus" role="timer" aria-label={`${stageLabel}倒计时`}>
        <div className="public-timer-focus__halo" aria-hidden="true" />
        <div className="public-timer-focus__stage">
          <span>当前</span>
          <strong>{stageLabel}</strong>
        </div>
        <p aria-live="polite">{timer.currentLabel}</p>
        <div className="public-timer-focus__summary">
          <span>私聊 {timer.privateMinutes}分</span>
          <i aria-hidden="true" />
          <span>公聊 {timer.publicMinutes}分</span>
        </div>
        <div className="public-timer-focus__actions">
          {timer.activeStage === 'private' && timer.hasElapsed ? (
            <Button variant="primary" onClick={timer.startPublic}><Play aria-hidden="true" /><span>开始公聊</span></Button>
          ) : timer.hasElapsed ? (
            <Button variant="secondary" disabled>可开始提名</Button>
          ) : (
            <Button variant={timer.isRunning ? 'secondary' : 'primary'} onClick={timer.startOrPause}>
              {timer.isRunning ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              <span>{actionLabel}</span>
            </Button>
          )}
          <Button variant="secondary" onClick={timer.resetCurrentStage}><RotateCcw aria-hidden="true" /><span>重置</span></Button>
          <Sheet
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            title="白天时长"
            description="私聊、公聊可分别设置。"
            presentation="page"
            contentClassName="sheet-content--timer-settings"
            trigger={<Button variant="ghost"><SlidersHorizontal aria-hidden="true" /><span>时长</span></Button>}
          >
            <DayTimerSettings
              open={settingsOpen}
              privateMinutes={timer.privateMinutes}
              publicMinutes={timer.publicMinutes}
              privateLocked={timer.activeStage === 'private' && timer.isRunning}
              publicLocked={timer.activeStage === 'public' && timer.isRunning}
              onOpenChange={setSettingsOpen}
              onApply={timer.setDurations}
            />
          </Sheet>
        </div>
      </section>
    </main>
  )
}
