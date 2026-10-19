import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import {
  isAppleMobileDevice,
  isAppleMobileSafari,
  isPWAStandalone,
  PWAInstallContext,
  type PWAInstallState,
} from './pwaInstallContext'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

/**
 * 安装事件只会给一次，所以由应用顶层长期接住；开局页或设置页晚些挂载时仍能使用。
 */
export function PWAInstallProvider({ children }: PropsWithChildren) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(() => isPWAStandalone())
  const [installing, setInstalling] = useState(false)
  const installingRef = useRef(false)

  useEffect(() => {
    const capturePrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    const markInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', capturePrompt)
    window.addEventListener('appinstalled', markInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', capturePrompt)
      window.removeEventListener('appinstalled', markInstalled)
    }
  }, [])

  const value = useMemo<PWAInstallState>(() => ({
    installed,
    promptAvailable: installPrompt !== null && !installing,
    appleMobile: isAppleMobileDevice(),
    appleMobileSafari: isAppleMobileSafari(),
    installing,
    install: async () => {
      if (!installPrompt || installingRef.current) return 'unavailable'
      installingRef.current = true
      setInstalling(true)
      const prompt = installPrompt
      // 事件只能消费一次；接受、取消或报错后都不能把旧事件留给下一次点击。
      setInstallPrompt(null)
      try {
        await prompt.prompt()
        const choice = await prompt.userChoice
        if (choice.outcome === 'accepted') setInstalled(true)
        return choice.outcome
      } catch {
        return 'error'
      } finally {
        installingRef.current = false
        setInstalling(false)
      }
    },
  }), [installPrompt, installed, installing])

  return <PWAInstallContext.Provider value={value}>{children}</PWAInstallContext.Provider>
}
