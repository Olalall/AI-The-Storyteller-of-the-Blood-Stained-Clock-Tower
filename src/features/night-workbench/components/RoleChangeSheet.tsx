import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Sheet } from '../../../components/ui/Sheet'
import type { RoleChangeReason, RoleSnapshot, WakeItem } from '../types'

const reasons: Array<{ id: RoleChangeReason; label: string }> = [
  { id: 'gameplay', label: '对局内变更' },
  { id: 'entry_correction', label: '纠正录入' },
  { id: 'other', label: '其他' },
]

interface RoleChangeSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: WakeItem
  currentRole: RoleSnapshot
  roles: RoleSnapshot[]
  onConfirm: (role: RoleSnapshot, reason: RoleChangeReason) => void
}

export function RoleChangeSheet({ open, onOpenChange, item, currentRole, roles, onConfirm }: RoleChangeSheetProps) {
  const [selectedId, setSelectedId] = useState('')
  const [reason, setReason] = useState<RoleChangeReason>('gameplay')
  const selectedRole = roles.find((role) => role.id === selectedId)

  useEffect(() => {
    if (open) {
      setSelectedId('')
      setReason('gameplay')
    }
  }, [open])

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={`更换${item.seatId}号角色`}
      description={`当前：${currentRole.name}`}
      contentClassName="sheet-content--role-change"
      presentation="page"
    >
      <div className="role-change-sheet">
        <fieldset>
          <legend>选择新角色</legend>
          <div className="role-change-grid">
            {roles.filter((role) => role.id !== currentRole.id).map((role) => (
              <button
                type="button"
                key={role.id}
                className={selectedId === role.id ? 'role-change-option is-selected' : 'role-change-option'}
                aria-pressed={selectedId === role.id}
                onClick={() => setSelectedId(role.id)}
              >
                <img src={role.iconPath} alt="" />
                <span>{role.name}</span>
              </button>
            ))}
          </div>
        </fieldset>
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
              <strong><RefreshCw aria-hidden="true" />{currentRole.name} → {selectedRole.name}</strong>
              <span>仅记录 · 不发送 · 夜序不自动调整</span>
            </div>
          ) : null}
          <div className="role-change-actions__buttons">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>取消</Button>
            <Button
              variant="primary"
              disabled={!selectedRole}
              onClick={() => {
                if (!selectedRole) return
                onConfirm(selectedRole, reason)
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
