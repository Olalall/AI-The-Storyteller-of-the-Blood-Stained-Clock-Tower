import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Sheet } from '../../../components/ui/Sheet'
import type { RoleChangeReason, RoleSnapshot, WakeItem } from '../types'
import type { NightWorkbenchSessionBinding } from '../state/gameSessionAdapter'
import { nightContextKey } from '../state/gameSessionAdapter'
import { projectCurrentAssignments } from '../../game-session/state/projectors'
import { changedRoleNightItems, hasUnsyncedRoleChange } from '../../game-session/state/confirmNightRoleChange'

const reasons: Array<{ id: RoleChangeReason; label: string }> = [
  { id: 'gameplay', label: '对局内变更' },
  { id: 'entry_correction', label: '纠正录入' },
  { id: 'other', label: '其他' },
]

interface RoleChangeSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: WakeItem
  binding: NightWorkbenchSessionBinding
  roles: RoleSnapshot[]
}

export function RoleChangeSheet({ open, onOpenChange, item, binding, roles }: RoleChangeSheetProps) {
  const { session, dispatchSession } = binding
  const assignments = projectCurrentAssignments(session)
  const [seatId, setSeatId] = useState(item.seatId)
  const [selectedId, setSelectedId] = useState('')
  const [reason, setReason] = useState<RoleChangeReason>('gameplay')
  const [timing, setTiming] = useState<'' | 'tonight' | 'initial' | 'later'>('')
  const currentRole = assignments.find((assignment) => assignment.seatId === seatId)?.role
  const selectedRole = roles.find((role) => role.id === selectedId)
  const hasNightAbility = selectedRole && changedRoleNightItems(session, seatId, selectedRole.id, 'preview').length > 0
  const hasInitialization = selectedRole && changedRoleNightItems(session, seatId, selectedRole.id, 'preview', 'initial').length > 0

  useEffect(() => {
    if (open) {
      setSeatId(item.seatId)
      setSelectedId('')
      setReason('gameplay')
      setTiming('')
    }
  }, [open, item.seatId])

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={`更换${seatId}号角色`}
      description={`当前：${currentRole?.name ?? '未分配'}；身份和当夜安排在确认后一起记录。`}
      contentClassName="sheet-content--role-change"
      presentation="page"
    >
      <div className="role-change-sheet">
        <label>变更玩家<select aria-label="变更玩家" value={seatId} onChange={(event) => { setSeatId(Number(event.target.value)); setSelectedId(''); setTiming('') }}>
          {assignments.map((assignment) => <option key={assignment.seatId} value={assignment.seatId}>{assignment.seatId}号 · {assignment.role.name}</option>)}
        </select></label>
        <fieldset>
          <legend>选择新角色</legend>
          <div className="role-change-grid">
            {roles.filter((role) => role.id !== currentRole?.id || hasUnsyncedRoleChange(session, seatId)).map((role) => (
              <button
                type="button"
                key={role.id}
                className={selectedId === role.id ? 'role-change-option is-selected' : 'role-change-option'}
                aria-pressed={selectedId === role.id}
                onClick={() => { setSelectedId(role.id); setTiming('') }}
              >
                <img src={role.iconPath} alt="" />
                <span>{role.name}{role.id === currentRole?.id ? '（核对旧换角的当晚安排）' : ''}</span>
              </button>
            ))}
          </div>
        </fieldset>
        {selectedRole ? <fieldset className="role-change-timing">
          <legend>新能力当晚怎么处理</legend>
          <p>原角色未发动项会停用。请核对新能力时点、持续效果和使用次数；中途换角不重做开局人数修正，也不补发邪恶同伴信息。</p>
          {hasInitialization ? <label><input type="radio" name="role-change-timing" checked={timing === 'initial'} onChange={() => setTiming('initial')} />当晚只初始化新能力（选宿主，不额外攻击）</label> : null}
          <label><input type="radio" name="role-change-timing" checked={timing === 'tonight'} disabled={!hasNightAbility} onChange={() => setTiming('tonight')} />{hasInitialization ? '当晚处理普通夜间行动（不是选宿主）' : '当晚处理新能力'}</label>
          <label><input type="radio" name="role-change-timing" checked={timing === 'later'} onChange={() => setTiming('later')} />本夜不再发动新能力</label>
          {hasInitialization ? <p>新痢蛭必须在当晚选择存活宿主；普通攻击需要另核合法时点，不能替代宿主初始化或在本步多攻击一次。</p> : null}
          <p>{hasNightAbility ? '首夜信息也可当晚补充。已过时点、死亡触发、方古跳转等情况，由主持核对后选择；方古跳转不能额外攻击一次。' : '本夜没有该角色的夜间录入项；白天或被动能力仍按规则处理。'}</p>
        </fieldset> : null}
        <fieldset>
          <legend>变更原因</legend>
          <div className="role-change-reasons">
            {reasons.map((option) => (
              <button
                type="button"
                key={option.id}
                className={reason === option.id ? 'choice-chip choice-chip--selected' : 'choice-chip'}
                aria-pressed={reason === option.id}
                onClick={() => setReason(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="role-change-actions">
          {selectedRole ? (
            <div className="role-change-actions__summary">
              <strong><RefreshCw aria-hidden="true" />{currentRole?.name} → {selectedRole.name}</strong>
              <span>确认后更新身份与当夜夜序；生死、阵营和毒醉分别确认，不发送玩家消息。</span>
            </div>
          ) : null}
          <div className="role-change-actions__buttons">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>取消</Button>
            <Button
              variant="primary"
              disabled={!selectedRole || !currentRole || !timing}
              onClick={() => {
                const run = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
                if (!selectedRole || !currentRole || !timing || !run) return
                dispatchSession({ type: 'confirm-night-role-change', nightRunId: run.id, seatId,
                  expectedRoleId: currentRole.id, roleId: selectedRole.id, timing, reason,
                  id: `${run.id}-role-${run.revision + 1}-${seatId}`, expectedContextKey: nightContextKey(session),
                  expectedRevision: run.revision, confirmedAt: new Date().toISOString(),
                })
                onOpenChange(false)
              }}
            >
              {selectedRole ? `确认改为${selectedRole.name}` : '确认更换'}
            </Button>
          </div>
        </div>
      </div>
    </Sheet>
  )
}
