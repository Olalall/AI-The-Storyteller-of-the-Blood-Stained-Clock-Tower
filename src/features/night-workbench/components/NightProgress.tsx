import type { WakeItem } from '../types'

export function NightProgress({
  queue,
  activeItem,
  concealed,
}: {
  queue: WakeItem[]
  activeItem: WakeItem
  concealed: boolean
}) {
  const visibleQueue = concealed ? queue.filter((item) => !item.systemStep?.sensitive) : queue
  const activeIndex = visibleQueue.findIndex((item) => item.id === activeItem.id)
  const completed = visibleQueue.filter((item) => item.progress === 'confirmed').length
  const deferred = visibleQueue.filter((item) => item.progress === 'deferred').length
  const needsReview = visibleQueue.filter((item) => item.applicability === 'needs_review').length

  return (
    <div className="night-progress" aria-label={concealed
      ? '当前夜序已遮蔽'
      : `当前夜序第${activeIndex + 1}项，共${visibleQueue.length}项`}>
      <p className="night-progress__numbers">
        <span>夜序</span>
        <strong>{concealed ? '—' : activeIndex + 1}</strong>
        <small>{concealed ? '' : `/${visibleQueue.length}`}</small>
      </p>
      <div className="night-progress__track" aria-hidden="true">
        <i style={{ width: concealed || !visibleQueue.length
          ? '0%'
          : `${((activeIndex + 1) / visibleQueue.length) * 100}%` }} />
      </div>
      <div className="night-progress__meta">
        {concealed ? <span>信息已遮蔽</span> : <span>已确认 {completed}</span>}
        {!concealed && deferred ? <span>暂缓 {deferred}</span> : null}
        {!concealed && needsReview ? <span>待核对 {needsReview}</span> : null}
      </div>
    </div>
  )
}
