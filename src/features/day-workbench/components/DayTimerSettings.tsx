import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'

const minimumMinutes = 1
const maximumMinutes = 180

interface DayTimerSettingsProps {
  open: boolean
  privateMinutes: number
  publicMinutes: number
  privateLocked: boolean
  publicLocked: boolean
  onOpenChange: (open: boolean) => void
  onApply: (durations: { privateMinutes: number; publicMinutes: number }) => void
}

function validMinutes(value: string) {
  const minutes = Number(value)
  return Number.isInteger(minutes) && minutes >= minimumMinutes && minutes <= maximumMinutes
    ? minutes
    : null
}

export function DayTimerSettings({
  open,
  privateMinutes,
  publicMinutes,
  privateLocked,
  publicLocked,
  onOpenChange,
  onApply,
}: DayTimerSettingsProps) {
  const [privateValue, setPrivateValue] = useState(String(privateMinutes))
  const [publicValue, setPublicValue] = useState(String(publicMinutes))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setPrivateValue(String(privateMinutes))
    setPublicValue(String(publicMinutes))
    setError('')
  }, [open, privateMinutes, publicMinutes])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextPrivate = privateLocked ? privateMinutes : validMinutes(privateValue)
    const nextPublic = publicLocked ? publicMinutes : validMinutes(publicValue)
    if (nextPrivate === null || nextPublic === null) {
      setError(`请输入 ${minimumMinutes}–${maximumMinutes} 的整数分钟`)
      return
    }
    onApply({ privateMinutes: nextPrivate, publicMinutes: nextPublic })
    onOpenChange(false)
  }

  return (
    <form className="day-timer-settings" onSubmit={submit}>
      <div className="day-timer-settings__fields">
        <label>
          <span>私聊</span>
          <span className="day-timer-settings__input"><input aria-label="私聊分钟数" type="number" min={minimumMinutes} max={maximumMinutes} step="1" value={privateValue} disabled={privateLocked} onChange={(event) => setPrivateValue(event.target.value)} /><em>分</em></span>
          {privateLocked ? <small>正在计时</small> : null}
        </label>
        <label>
          <span>公聊</span>
          <span className="day-timer-settings__input"><input aria-label="公聊分钟数" type="number" min={minimumMinutes} max={maximumMinutes} step="1" value={publicValue} disabled={publicLocked} onChange={(event) => setPublicValue(event.target.value)} /><em>分</em></span>
          {publicLocked ? <small>正在计时</small> : null}
        </label>
      </div>
      {error ? <p className="day-timer-settings__error" role="alert">{error}</p> : null}
      <Button type="submit" variant="primary">保存时长</Button>
    </form>
  )
}
