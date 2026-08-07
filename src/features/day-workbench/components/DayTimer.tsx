import { Pause, Play, RotateCcw, SlidersHorizontal, MonitorPlay } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Sheet } from '../../../components/ui/Sheet'
import { useDiscussionTimer } from '../state/useDiscussionTimer'
import { DayTimerSettings } from './DayTimerSettings'

const stageLabels = { private: '私聊', public: '公聊' } as const

export function DayTimer({ onProject }: { onProject?: () => void }) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const timer = useDiscussionTimer()
  const stageLabel = stageLabels[timer.activeStage]
  const nextStage = timer.activeStage === 'private'
  const status = timer.activeStage === 'public' && timer.hasElapsed ? '可开始提名' : null
  const actionLabel = timer.isRunning ? `暂停${stageLabel}` : `开始${stageLabel}`

  return (
    <section className="day-timer" aria-label="白天节奏计时" role="timer">
      <div className="day-timer__main">
        <div className="day-timer__current">
          <span className="day-timer__label">{stageLabel}</span>
          <strong aria-live="polite">{timer.currentLabel}</strong>
          {status ? <em>{status}</em> : null}
        </div>
        {nextStage ? <span className="day-timer__next">下一段：公聊 {timer.publicMinutes}分</span> : null}
      </div>
      <div className="day-timer__controls">
        <Sheet
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          title="白天时长"
          description="私聊、公聊可分别设置。"
          presentation="page"
          contentClassName="sheet-content--timer-settings"
          trigger={<Button variant="ghost" compact className="day-timer__settings" aria-label="设置私聊和公聊时长"><SlidersHorizontal aria-hidden="true" /><span>时长</span></Button>}
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
        <div className="day-timer__actions">
          {onProject ? (
            <Button variant="ghost" compact aria-label="投屏倒计时给玩家看" onClick={onProject}>
              <MonitorPlay aria-hidden="true" /><span>投屏</span>
            </Button>
          ) : null}
          {timer.activeStage === 'private' && timer.hasElapsed ? (
            <Button variant="primary" compact aria-label="开始公聊倒计时" onClick={timer.startPublic}>
              <Play aria-hidden="true" /><span>开始公聊</span>
            </Button>
          ) : timer.hasElapsed ? null : (
            <Button variant={timer.isRunning ? 'secondary' : 'primary'} compact aria-label={`${actionLabel}倒计时`} onClick={timer.startOrPause}>
              {timer.isRunning ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}<span>{actionLabel}</span>
            </Button>
          )}
          <Button variant="ghost" compact aria-label={`重置${stageLabel}倒计时`} onClick={timer.resetCurrentStage}>
            <RotateCcw aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  )
}
