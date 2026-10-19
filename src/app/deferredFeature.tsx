import { lazy, Suspense, useState } from 'react'
import type { ComponentType } from 'react'
import { FeatureBoundary, LoadingFeedback } from './DeferredFeatureFeedback'

/** 首次打开才加载，关闭后保留组件实例，避免清空面板内部尚未确认的草稿。 */
export function deferredPanel<P extends { open: boolean; onOpenChange: (open: boolean) => void }>(title: string | ((props: P) => string), load: () => Promise<{ default: ComponentType<P> }>) {
  const Loaded = lazy(load)
  return function DeferredPanel(props: P) {
    const [activated, setActivated] = useState(props.open)
    if (props.open && !activated) setActivated(true)
    if (!activated && !props.open) return null
    const feedback = { title: typeof title === 'function' ? title(props) : title, open: props.open, onClose: () => props.onOpenChange(false), returnLabel: '返回上一步' }
    return <FeatureBoundary {...feedback}><Suspense fallback={<LoadingFeedback {...feedback} />}><Loaded {...props} /></Suspense></FeatureBoundary>
  }
}

/** 工作台仍保持原有离开即卸载的语义，对局状态由 App 的统一会话持有。 */
export function deferredView<P extends { onExit: () => void }>(title: string, load: () => Promise<{ default: ComponentType<P> }>) {
  const Loaded = lazy(load)
  return function DeferredView(props: P) {
    const feedback = { title, open: true, onClose: props.onExit, returnLabel: '返回本局' }
    return <FeatureBoundary {...feedback}><Suspense fallback={<LoadingFeedback {...feedback} />}><Loaded {...props} /></Suspense></FeatureBoundary>
  }
}
