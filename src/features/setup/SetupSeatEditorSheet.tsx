import { ArrowRight, PencilLine, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import type { PlayerSeat } from '../game-session/types'
import type { RoleSnapshot } from '../night-workbench/types'
import type { SetupTeam } from './types'
import './setup.css'

export type SetupSeatEditorKind = 'role' | 'nickname'

interface SetupSeatEditorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: SetupSeatEditorKind | null
  seat: PlayerSeat | null
  currentRole: RoleSnapshot | null
  roles: RoleSnapshot[]
  teamByRoleId: Readonly<Record<string, SetupTeam>>
  inPlayRoleIds: Set<string>
  onReplaceRole: (role: RoleSnapshot) => void
  onSaveNickname: (nickname: string) => void
}

function teamLabel(team?: SetupTeam) {
  if (!team) return '待核对'
  return ({ townsfolk: '镇民', outsider: '外来者', minion: '爪牙', demon: '恶魔' } as const)[team]
}

export function SetupSeatEditorSheet({
  open,
  onOpenChange,
  kind,
  seat,
  currentRole,
  roles,
  teamByRoleId,
  inPlayRoleIds,
  onReplaceRole,
  onSaveNickname,
}: SetupSeatEditorSheetProps) {
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [nickname, setNickname] = useState('')

  useEffect(() => {
    if (!open) return
    setSelectedRoleId('')
    setNickname(seat?.nickname ?? '')
  }, [open, seat])

  const selectedRole = useMemo(() => roles.find((role) => role.id === selectedRoleId) ?? null, [roles, selectedRoleId])
  const isRoleEditor = kind === 'role' && seat && currentRole
  const isNicknameEditor = kind === 'nickname' && seat
  const title = isRoleEditor ? `更换${seat.seatId}号角色` : isNicknameEditor ? `修改${seat.seatId}号昵称` : '调整座位'
  const description = isRoleEditor
    ? '选择后只改草稿；确认配板前不会影响本局。'
    : '昵称只供说书人辨认，不关联账号或外部身份。'

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      contentClassName="sheet-content--setup-editor"
      presentation="page"
      layer="nested"
    >
      <div className="setup-seat-editor">
        {isRoleEditor ? <>
          <section className="setup-seat-editor__summary" aria-label="角色替换预览">
            <span>当前角色</span>
            <strong>{currentRole.name}</strong>
            <ArrowRight aria-hidden="true" />
            <span>{selectedRole ? '将替换为' : '选择新角色'}</span>
            <strong>{selectedRole?.name ?? '未选择'}</strong>
          </section>
          <section className="setup-seat-editor__roles" aria-labelledby="setup-role-picker-title">
            <div><span>角色库</span><h3 id="setup-role-picker-title">选择未在场角色</h3></div>
            <div className="setup-seat-editor__role-grid">
              {roles.map((role) => {
                const unavailable = role.id !== currentRole.id && inPlayRoleIds.has(role.id)
                return <button
                  type="button"
                  key={role.id}
                  className={selectedRoleId === role.id ? 'is-selected' : ''}
                  disabled={unavailable || role.id === currentRole.id}
                  aria-pressed={selectedRoleId === role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                >
                  <img src={role.iconPath} alt="" />
                  <span><strong>{role.name}</strong><small>{unavailable ? '已在场' : teamLabel(teamByRoleId[role.id])}</small></span>
                </button>
              })}
            </div>
          </section>
          <section className="setup-seat-editor__impact" aria-label="调整影响">
            <RefreshCw aria-hidden="true" />
            <p>只替换草稿中的{seat.seatId}号角色。人数核对与伪装建议会随草稿重新检查。</p>
          </section>
          <div className="setup-seat-editor__actions">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>取消</Button>
            <Button variant="primary" disabled={!selectedRole} onClick={() => {
              if (!selectedRole) return
              onReplaceRole(selectedRole)
              onOpenChange(false)
            }}>应用替换</Button>
          </div>
        </> : isNicknameEditor ? <>
          <label className="setup-seat-editor__nickname">昵称
            <input aria-label={`${seat.seatId}号昵称`} autoFocus value={nickname} maxLength={24} placeholder={`${seat.label}的昵称`} onChange={(event) => setNickname(event.target.value)} />
            <small>例如：阿杰、红帽。留空时只显示座位号。</small>
          </label>
          <div className="setup-seat-editor__impact"><PencilLine aria-hidden="true" /><p>保存后，夜晚卡片与本局状态面板会立即显示新昵称。</p></div>
          <div className="setup-seat-editor__actions">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>取消</Button>
            <Button variant="primary" onClick={() => {
              onSaveNickname(nickname)
              onOpenChange(false)
            }}>保存昵称</Button>
          </div>
        </> : null}
      </div>
    </Sheet>
  )
}
