import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { RoleDisc } from '../../../components/ui/RoleDisc'
import { StatusBadge } from '../../../components/ui/StatusBadge'
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
  isPreviewing: boolean
  onPrevious: () => void
  onNext: () => void
}

function NeighborDisc({ item, role, direction, concealed }: { item?: WakeItem; role?: RoleSnapshot; direction: 'previous' | 'next'; concealed: boolean }) {
  if (!item) return <div className="carousel-neighbor carousel-neighbor--empty"><span>边界</span></div>
  const displayRole = role ?? { id: item.roleId, name: item.roleName, initial: item.roleInitial, iconPath: item.iconPath }
  return (
    <div className={`carousel-neighbor carousel-neighbor--${direction}`}>
      <RoleDisc initial={displayRole.initial} roleName={displayRole.name} imageSrc={displayRole.iconPath} size="small" concealed={concealed} changed={displayRole.id !== item.roleId} />
      <span className="carousel-neighbor__label">{concealed ? `${item.seatId}号` : displayRole.name}</span>
      <small>{item.seatId}号 · {progressMeta[item.progress].label}</small>
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
  isPreviewing,
  onPrevious,
  onNext,
}: NightPlayerCarouselProps) {
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
          <StatusBadge tone={isPreviewing ? 'warning' : 'current'}>
            {isPreviewing ? '正在预览' : '正在处理'}
          </StatusBadge>
          <span>夜序 {current.orderIndex}</span>
        </div>
        <div className="carousel-current__token-stage" aria-hidden="true">
          <RoleDisc
            initial={currentRole.initial}
            roleName={currentRole.name}
            imageSrc={currentRole.iconPath}
            size="large"
            active={!isPreviewing}
            concealed={concealed}
            changed={Boolean(currentRoleChange)}
          />
        </div>
        <div className={`carousel-current__copy ${concealed ? 'concealed-copy' : ''}`}>
          <strong>{concealed ? '角色信息已遮蔽' : currentRole.name}</strong>
          <span>{current.playerLabel}</span>
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
