import { Field } from '../../../components/ui/Field'
import type { NightSeatSnapshot, WakeDraft, WakeItem } from '../types'
import { seatDescription } from './seatDescription'
import './night-target-role-choices.css'

interface Props {
  item: WakeItem
  draft: WakeDraft
  disabled: boolean
  playerCount: number
  seats?: Record<number, NightSeatSnapshot>
  onChange: (index: number, choice: { seatId?: number; roleId?: string }) => void
}

export function NightTargetRoleChoices({ item, draft, disabled, playerCount, seats, onChange }: Props) {
  const choices = draft.targetRoleChoices ?? []
  return <fieldset disabled={disabled}>
    <legend>首夜爪牙分配 <span>{choices.filter((choice) => choice.seatId > 0 && choice.roleId).length}/{item.targetRoleChoiceCount}</span></legend>
    <small>每组选择一位玩家和一个本板爪牙，均不可重复。这里只记录选择，应用分配需另行确认。</small>
    <div className="night-target-role-choices">
      {Array.from({ length: item.targetRoleChoiceCount ?? 0 }, (_, index) => {
        const selected = choices[index] ?? { seatId: 0, roleId: '' }
        return <div key={index} className="night-target-role-choice">
          <Field label={`第${index + 1}组玩家`}>
            <select value={selected.seatId} onChange={(event) => onChange(index, { seatId: Number(event.target.value) })}>
              <option value={0}>选择玩家</option>
              {Array.from({ length: playerCount }, (_, seat) => seat + 1).map((seatId) => <option key={seatId} value={seatId}
                disabled={choices.some((choice, row) => row !== index && choice.seatId === seatId)}>{seatId}号 {seatDescription(seats?.[seatId]) ?? '玩家'}</option>)}
            </select>
          </Field>
          <Field label={`第${index + 1}组爪牙`}>
            <select value={selected.roleId} onChange={(event) => onChange(index, { roleId: event.target.value })}>
              <option value="">选择爪牙</option>
              {item.roleChoices?.map((role) => <option key={role.id} value={role.id}
                disabled={choices.some((choice, row) => row !== index && choice.roleId === role.id)}>{role.label}</option>)}
            </select>
          </Field>
        </div>
      })}
    </div>
  </fieldset>
}
