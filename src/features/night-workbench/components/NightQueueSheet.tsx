import { ListMusic } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Sheet } from '../../../components/ui/Sheet'
import { getOfficialNightOrder } from '../data/officialNightOrder'
import type { NightOrderListItem, NightType, WakeItem } from '../types'
import { NightQueueList } from './NightQueueList'

interface NightQueueSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  queue: WakeItem[]
  nightType: NightType
  activeCursorId: string
  previewEntryId: string
  concealed: boolean
  completed: number
  deferred: number
  needsReview: number
  onPreview: (id: string) => void
}

export function NightQueueSheet({
  open,
  onOpenChange,
  queue,
  nightType,
  activeCursorId,
  previewEntryId,
  concealed,
  completed,
  deferred,
  needsReview,
  onPreview,
}: NightQueueSheetProps) {
  const [view, setView] = useState<'game' | 'official'>('game')
  const currentItems: NightOrderListItem[] = queue.map((item) => ({
    id: item.id,
    kind: 'game',
    orderIndex: item.orderIndex,
    roleId: item.roleId,
    roleName: item.roleName,
    roleInitial: item.roleInitial,
    iconPath: item.iconPath,
    seatId: item.seatId,
    playerLabel: item.playerLabel,
    history: item.history,
    progress: item.progress,
    applicability: item.applicability,
  }))
  const officialItems = getOfficialNightOrder(nightType)
  const nightTypeLabel = nightType === 'first' ? '首夜' : '其他夜'

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setView('game')
    onOpenChange(nextOpen)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={handleOpenChange}
      title="夜间顺序"
      description={view === 'game'
        ? `本局 · ${queue.length}项 · 已确认${completed} · 暂缓${deferred} · 待核对${needsReview}`
        : `官方 · ${nightTypeLabel} · ${officialItems.length}项`}
      presentation="page"
      trigger={(
        <Button variant="secondary" compact aria-label="夜间顺序">
          <ListMusic aria-hidden="true" />
          <span className="header-action-label header-action-label--full">夜间顺序</span>
          <span className="header-action-label header-action-label--compact" aria-hidden="true">夜序</span>
        </Button>
      )}
    >
      <div className="night-order-switch" role="tablist" aria-label="夜间顺序范围">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'game'}
          className={view === 'game' ? 'night-order-switch__item night-order-switch__item--active' : 'night-order-switch__item'}
          onClick={() => setView('game')}
        >
          本局
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'official'}
          className={view === 'official' ? 'night-order-switch__item night-order-switch__item--active' : 'night-order-switch__item'}
          onClick={() => setView('official')}
        >
          官方
        </button>
      </div>
      <NightQueueList
        items={view === 'game' ? currentItems : officialItems}
        activeCursorId={view === 'game' ? activeCursorId : undefined}
        previewEntryId={view === 'game' ? previewEntryId : undefined}
        concealed={view === 'game' && concealed}
        onPreview={view === 'game'
          ? (id) => {
              onPreview(id)
              onOpenChange(false)
            }
          : undefined}
      />
    </Sheet>
  )
}
