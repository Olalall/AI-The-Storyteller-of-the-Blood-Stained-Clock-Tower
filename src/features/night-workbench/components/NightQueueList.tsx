import { AlertTriangle, Check, Clock3, Eye } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { RoleDisc } from '../../../components/ui/RoleDisc'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import type { NightOrderListItem, WakeProgress } from '../types'
import { progressMeta } from './statusMeta'

interface NightQueueListProps {
  items: NightOrderListItem[]
  activeCursorId?: string
  previewEntryId?: string
  concealed: boolean
  onPreview?: (id: string) => void
}

function ProgressIcon({ progress }: { progress: WakeProgress }) {
  if (progress === 'confirmed') return <Check aria-hidden="true" />
  if (progress === 'deferred') return <Clock3 aria-hidden="true" />
  return <Eye aria-hidden="true" />
}

export function NightQueueList({
  items,
  activeCursorId,
  previewEntryId,
  concealed,
  onPreview,
}: NightQueueListProps) {
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView?.({ block: 'center' })
  }, [activeCursorId])

  return (
    <ol className="night-queue-list">
      {items.map((item) => {
        const interactive = item.kind === 'game'
        const active = interactive && item.id === activeCursorId
        const previewed = interactive && item.id === previewEntryId
        const hidden = interactive && concealed
        const status = item.progress ? progressMeta[item.progress] : null
        // 系统步骤的 playerLabel 是爪牙/恶魔名单，遮蔽时不能露出；它也没有可称呼的座位号。
        const title = hidden
          ? item.systemStep ? item.roleName : `${item.seatId}号角色`
          : item.roleName
        const detail = item.systemStep
          ? hidden ? '名单已遮蔽' : item.playerLabel
          : `${item.playerLabel}${!hidden && item.history ? ` · ${item.history}` : hidden ? ' · 历史已遮蔽' : ''}`
        const content = (
          <>
            <span className="night-queue-item__index">{item.orderIndex}</span>
            <RoleDisc
              initial={item.roleInitial}
              roleName={item.roleName}
              imageSrc={item.iconPath}
              size="small"
              concealed={hidden}
            />
            <span className="night-queue-item__copy">
              <strong>{title}</strong>
              <small>
                {interactive ? detail : item.phaseMarker ? '阶段' : item.roleId}
              </small>
            </span>
            {item.applicability === 'needs_review' ? (
              <AlertTriangle className="night-queue-item__warning" aria-label="需要核对" />
            ) : null}
            {active ? <StatusBadge tone="current">正在处理</StatusBadge> : null}
            {status ? <StatusBadge tone={status.tone}>{status.label}</StatusBadge> : <span />}
            <span className="night-queue-item__icon">
              {item.progress ? <ProgressIcon progress={item.progress} /> : null}
            </span>
          </>
        )

        return (
          <li key={item.id}>
            {interactive ? (
              <button
                type="button"
                className={`night-queue-item ${active ? 'night-queue-item--active' : ''} ${previewed ? 'night-queue-item--previewed' : ''}`}
                onClick={() => onPreview?.(item.id)}
                aria-label={item.systemStep
                  ? `预览夜序第${item.orderIndex}项：${item.roleName}`
                  : `预览夜序第${item.orderIndex}项：${item.seatId}号${hidden ? '角色已遮蔽' : item.roleName}`}
                ref={active ? activeRef : undefined}
              >
                {content}
              </button>
            ) : (
              <div className={`night-queue-item night-queue-item--reference ${item.phaseMarker ? 'night-queue-item--phase' : ''}`}>
                {content}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
