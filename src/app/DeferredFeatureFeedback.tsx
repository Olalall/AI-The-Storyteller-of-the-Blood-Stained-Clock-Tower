import { Component } from 'react'
import type { PropsWithChildren } from 'react'
import { Sheet } from '../components/ui/Sheet'
import { Button } from '../components/ui/Button'
import './deferred-feature.css'

type FeedbackProps = { open: boolean; title: string; onClose: () => void; returnLabel?: string }
export function LoadingFeedback({ open, title, onClose, failed = false, returnLabel = '返回上一步' }: FeedbackProps & { failed?: boolean }) {
  return <Sheet open={open} onOpenChange={(next) => { if (!next) onClose() }} title={title} description={failed ? '页面资源加载失败，请检查网络后重新加载页面。' : '正在加载，请稍候。'}>
    <div className="deferred-feature-feedback" role={failed ? 'alert' : 'status'}>
      <p>{failed ? '当前对局未被重置。重新加载前请处理浏览器的未保存提醒。' : '首次打开需要加载此功能。'}</p>
      <Button onClick={onClose}>{returnLabel}</Button>
      {failed ? <Button onClick={() => window.location.reload()}>重新加载页面</Button> : null}
    </div>
  </Sheet>
}
export class FeatureBoundary extends Component<PropsWithChildren<FeedbackProps>, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <LoadingFeedback {...this.props} failed /> : this.props.children }
}

