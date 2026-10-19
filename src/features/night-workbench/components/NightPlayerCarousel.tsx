import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { RoleDisc } from '../../../components/ui/RoleDisc'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { isPreviewMode, type WorkbenchMode } from '../state/workbenchMode'
import type { RoleChangeEvent, RoleSnapshot, WakeItem } from '../types'
import { progressMeta } from './statusMeta'

interface NightPlayerCarouselProps {
  current: WakeItem
  currentRole: RoleSnapshot
  currentRoleChange?: RoleChangeEvent
  previous?: WakeItem
  previousRole?: RoleSnapshot
  next?: WakeItem
  nextRole?: RoleSnapshot
  concealed: boolean
  mode: WorkbenchMode
  onPrevious: () => void
  onNext: () => void
}

function NeighborDisc({ item, role, direction, concealed }: { item?: WakeItem; role?: RoleSnapshot; direction: 'previous' | 'next'; concealed: boolean }) {
  if (!item) return <div className="carousel-neighbor carousel-neighbor--empty"><span>边界</span></div>
  const displayRole = role ?? { id: item.roleId, name: item.roleName, initial: item.roleInitial, iconPath: item.iconPath }
  return (
    <div className={`carousel-neighbor carousel-neighbor--${direction}`}>
      <RoleDisc initial={displayRole.initial} roleName={displayRole.name} imageSrc={displayRole.iconPath} size="small" concealed={concealed} changed={displayRole.id !== item.roleId} />
      <span className="carousel-neighbor__label">{
        concealed && item.systemStep?.sensitive
          ? '系统步骤已遮蔽'
          : concealed && !item.systemStep ? `${item.seatId}号` : displayRole.name
      }</span>
      <small>{item.systemStep ? '系统步骤' : `${item.seatId}号`} · {progressMeta[item.progress].label}</small>
    </div>
  )
}

export function NightPlayerCarousel({
  current,
  currentRole,
  currentRoleChange,
  previous,
  previousRole,
  next,
  nextRole,
  concealed,
  mode,
  onPrevious,
  onNext,
}: NightPlayerCarouselProps) {
  const previewing = isPreviewMode(mode)
  return (
    <section className="night-carousel" role="region" aria-label="夜间角色预览">
      <button
        className="carousel-hit carousel-hit--previous"
        type="button"
        onClick={onPrevious}
        disabled={!previous}
        aria-label="预览上一位"
      >
        <ChevronLeft aria-hidden="true" />
        <NeighborDisc item={previous} role={previousRole} direction="previous" concealed={concealed} />
      </button>

      <div className="carousel-current">
        <div className="carousel-current__eyebrow">
          <StatusBadge tone={previewing ? 'warning' : 'current'}>
            {previewing ? '正在预览' : '正在处理'}
          </StatusBadge>
          <span>夜序 {current.orderIndex}</span>
        </div>
        <div className="carousel-current__token-stage" aria-hidden="true">
          <RoleDisc
            initial={currentRole.initial}
            roleName={currentRole.name}
            imageSrc={currentRole.iconPath}
            size="large"
            active={!previewing}
            concealed={concealed}
            changed={Boolean(currentRoleChange)}
          />
        </div>
        <div className={`carousel-current__copy ${concealed ? 'concealed-copy' : ''}`}>
          <strong>{
            concealed && current.systemStep?.sensitive
              ? '系统步骤已遮蔽'
              : concealed && !current.systemStep ? '角色信息已遮蔽' : currentRole.name
          }</strong>
          {/* 系统步骤的 playerLabel 就是爪牙/恶魔名单本身，遮蔽时不能照原样显示。 */}
          <span>{concealed && current.systemStep ? '名单已遮蔽' : current.playerLabel}</span>
          {!concealed && currentRoleChange ? (
            <small className="carousel-current__change"><RefreshCw aria-hidden="true" />已变更 · 原{currentRoleChange.fromRole.name}</small>
          ) : null}
        </div>
      </div>

      <button
        className="carousel-hit carousel-hit--next"
        type="button"
        onClick={onNext}
        disabled={!next}
        aria-label="预览下一位"
      >
        <NeighborDisc item={next} role={nextRole} direction="next" concealed={concealed} />
        <ChevronRight aria-hidden="true" />
      </button>
    </section>
  )
}
