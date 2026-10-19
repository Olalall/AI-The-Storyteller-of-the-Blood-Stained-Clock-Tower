import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import type { RoleSnapshot } from '../night-workbench/types'

export function IdentityPresentationEditor({ seatId, roles, currentRoleId, onConfirm }: {
  seatId: number
  roles: RoleSnapshot[]
  currentRoleId?: string
  onConfirm?: (roleId: string) => void
}) {
  const [selected, setSelected] = useState(currentRoleId ?? '')
  useEffect(() => { setSelected(currentRoleId ?? '') }, [seatId, currentRoleId])
  return <section className="identity-deal__identity-choice" aria-label="确认对外身份">
    <label>对外身份
      <select aria-label={`${seatId}号对外身份`} value={selected} onChange={(event) => setSelected(event.target.value)}>
        <option value="">请选择实际交给玩家的角色</option>
        {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
      </select>
    </label>
    <p>先确认玩家应看到的身份，再打开单人展示。真实身份只留给说书人。</p>
    <Button variant="secondary" disabled={!onConfirm || !roles.some((role) => role.id === selected) || selected === currentRoleId} onClick={() => onConfirm?.(selected)}>确认对外身份</Button>
  </section>
}
