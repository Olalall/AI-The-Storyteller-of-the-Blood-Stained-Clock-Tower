import { Download, Share2, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { usePWAInstall } from './pwaInstallContext'
import './pwa.css'

interface PWAInstallCardProps {
  compact?: boolean
  emphasized?: boolean
}

/**
 * 安装始终是显式动作，绝不自动弹窗打断主持。
 * 没有 beforeinstallprompt 时只说明浏览器菜单路径，不对未经真机验证的浏览器能力下绝对结论。
 */
export function PWAInstallCard({ compact = false, emphasized = false }: PWAInstallCardProps) {
  const { installed, promptAvailable, appleMobile, appleMobileSafari, installing, install: requestInstall } = usePWAInstall()
  const [installMessage, setInstallMessage] = useState('')

  if (installed) {
    return (
      <aside className={`pwa-install-card pwa-install-card--installed ${compact ? 'pwa-install-card--compact' : ''}`} aria-label="应用安装状态">
        <Smartphone aria-hidden="true" />
        <span><strong>已安装到本机</strong><small>以后可从桌面直接打开；核心主持功能可离线使用。</small></span>
      </aside>
    )
  }

  async function install() {
    setInstallMessage('')
    const outcome = await requestInstall()
    if (outcome === 'dismissed') setInstallMessage('已取消安装；之后可从浏览器菜单再次选择“安装应用”。')
    if (outcome === 'unavailable' || outcome === 'error') {
      setInstallMessage('浏览器没有打开安装窗口；请从浏览器菜单选择“安装应用”或“添加到主屏幕”。')
    }
  }

  return (
    <aside className={`pwa-install-card ${compact ? 'pwa-install-card--compact' : ''}`} aria-labelledby="pwa-install-title">
      <span className="pwa-install-card__icon"><Smartphone aria-hidden="true" /></span>
      <span className="pwa-install-card__copy">
        <strong id="pwa-install-title">下载安装到手机/平板</strong>
        <small>
          {appleMobile
              ? '打开浏览器的“分享”或菜单，选择“添加到主屏幕”；如果当前浏览器没有这个入口，可再尝试 Safari。首次完整打开后，核心主持可离线使用。'
            : '安装后可像普通应用一样从桌面打开；首次完整打开后，核心主持可离线使用。'}
        </small>
      </span>
      {promptAvailable ? (
        <Button type="button" variant={emphasized ? 'primary' : 'secondary'} compact disabled={installing} onClick={() => { void install() }}>
          <Download aria-hidden="true" />安装
        </Button>
      ) : appleMobileSafari ? <Share2 className="pwa-install-card__hint-icon" aria-hidden="true" /> : appleMobile ? (
        <small className="pwa-install-card__fallback">分享/菜单 → “添加到主屏幕”；没有入口可再尝试 Safari</small>
      ) : (
        <small className="pwa-install-card__fallback">浏览器菜单 → “安装应用”或“添加到主屏幕”；没有该选项时请用 Chrome 打开</small>
      )}
      {installMessage ? <small className="pwa-install-card__message" role="status">{installMessage}</small> : null}
    </aside>
  )
}
