import { createContext, useContext } from 'react'

export type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable' | 'error'

export interface PWAInstallState {
  installed: boolean
  promptAvailable: boolean
  appleMobile: boolean
  appleMobileSafari: boolean
  installing: boolean
  install: () => Promise<InstallOutcome>
}

export function isPWAStandalone() {
  return (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
}

export function isAppleMobileDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export function isAppleMobileSafari() {
  return isAppleMobileDevice() && /Safari/i.test(navigator.userAgent) && !/(CriOS|FxiOS|EdgiOS|OPiOS)/i.test(navigator.userAgent)
}

const fallbackInstallState: PWAInstallState = {
  installed: false,
  promptAvailable: false,
  appleMobile: false,
  appleMobileSafari: false,
  installing: false,
  install: async () => 'unavailable',
}

export const PWAInstallContext = createContext<PWAInstallState>(fallbackInstallState)

export function usePWAInstall() {
  return useContext(PWAInstallContext)
}
