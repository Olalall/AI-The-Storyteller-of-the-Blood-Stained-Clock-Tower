import { CloudOff, DownloadCloud, RefreshCw, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '../../components/ui/Button'
import './pwa.css'

interface PWAStatusNoticesProps {
  hasStarted: boolean
  canReload?: boolean
}

export function PWAStatusNotices({ hasStarted, canReload = false }: PWAStatusNoticesProps) {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [deferredUntilGameEnds, setDeferredUntilGameEnds] = useState(false)
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    const markOnline = () => setOnline(true)
    const markOffline = () => setOnline(false)
    window.addEventListener('online', markOnline)
    window.addEventListener('offline', markOffline)
    return () => {
      window.removeEventListener('online', markOnline)
      window.removeEventListener('offline', markOffline)
    }
  }, [])

  useEffect(() => {
    if (!needRefresh) setDeferredUntilGameEnds(false)
  }, [needRefresh])

  const showUpdate = needRefresh && (!hasStarted || !deferredUntilGameEnds)
  return (
    <section className="pwa-status-stack" aria-label="应用运行状态">
      {!online ? (
        <div className="pwa-status-notice pwa-status-notice--offline" role="status">
          <CloudOff aria-hidden="true" />
          <span><strong>当前离线</strong><small>本机存档保留，已缓存的页面可继续使用；未缓存资料、AI与云端归档需要联网。</small></span>
        </div>
      ) : null}

      {offlineReady && !hasStarted ? (
        <div className="pwa-status-notice pwa-status-notice--ready" role="status">
          <DownloadCloud aria-hidden="true" />
          <span><strong>离线版本已准备好</strong><small>已缓存页面可离线使用，未缓存内容仍需联网。</small></span>
          <button type="button" className="pwa-status-notice__close" aria-label="关闭离线提示" onClick={() => setOfflineReady(false)}>
            <X aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {showUpdate ? (
        <div className="pwa-status-notice pwa-status-notice--update" role="status">
          <RefreshCw aria-hidden="true" />
          <span>
            <strong>新版本已准备好</strong>
            <small>{hasStarted ? '为避免打断本局，请在本局结束后更新。' : canReload ? '现在更新会重新打开应用，本机存档不会被清空。' : '当前内容尚未确认保存，暂不能更新。'}</small>
          </span>
          {hasStarted ? (
            <button type="button" className="pwa-status-notice__close" aria-label="本局暂不更新" onClick={() => setDeferredUntilGameEnds(true)}>
              <X aria-hidden="true" />
            </button>
          ) : !canReload ? (
            <small>请先完成保存并处理编辑保护，再更新应用。</small>
          ) : (
            <Button type="button" variant="secondary" compact onClick={() => { void updateServiceWorker(true) }}>
              更新并重开
            </Button>
          )}
        </div>
      ) : null}
    </section>
  )
}
