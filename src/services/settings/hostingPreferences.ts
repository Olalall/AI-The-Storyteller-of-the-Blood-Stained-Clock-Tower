/**
 * 主持模式的**全局默认**。它只是新开一局时的初值来源，不是运行时真值。
 *
 * 为什么要有两层：纯全局的话，说书人改了偏好后回看旧归档，视图会跟着变，
 * 历史局的呈现就不再忠于当时的主持方式；纯每局的话，每开一局都要重问一次，
 * 是典型的甩锅。所以偏好只回答「下一局默认怎么开」，
 * 而「这一局当时是怎么主持的」永远只看 session.hostingMode。
 *
 * 硬规则：运行时任何地方读模式都只读 `session.hostingMode`，不读这里。
 * 只允许 App 层在建局时读一次。两个真相源一旦都能被渲染层读到，它们必然漂移，
 * 而漂移的表现是「同一局在两个地方显示成不同模式」——那时已经没法判断哪个对。
 */
import type { HostingMode } from '../../features/game-session/types'

export interface HostingPreferences {
  defaultHostingMode: HostingMode
  /** 首次引导卡问过没有。问过就不再打扰，除非用户自己去主持设置里改。 */
  hasCompletedFirstRunChoice: boolean
}

export const hostingPreferencesStorageKey = 'botc-copilot-hosting-preferences-v1'

export const defaultHostingPreferences: HostingPreferences = {
  defaultHostingMode: 'grimoire',
  hasCompletedFirstRunChoice: false,
}

function isHostingMode(value: unknown): value is HostingMode {
  return value === 'record' || value === 'grimoire'
}

export function normalizeHostingPreferences(value: unknown): HostingPreferences {
  if (!value || typeof value !== 'object') return defaultHostingPreferences
  const candidate = value as Partial<HostingPreferences>
  return {
    defaultHostingMode: isHostingMode(candidate.defaultHostingMode)
      ? candidate.defaultHostingMode
      : defaultHostingPreferences.defaultHostingMode,
    hasCompletedFirstRunChoice: candidate.hasCompletedFirstRunChoice === true,
  }
}

export function readHostingPreferences(): HostingPreferences {
  try {
    const stored = window.localStorage.getItem(hostingPreferencesStorageKey)
    return stored ? normalizeHostingPreferences(JSON.parse(stored)) : defaultHostingPreferences
  } catch {
    return defaultHostingPreferences
  }
}

export function saveHostingPreferences(preferences: HostingPreferences) {
  try {
    window.localStorage.setItem(
      hostingPreferencesStorageKey,
      JSON.stringify(normalizeHostingPreferences(preferences)),
    )
  } catch {
    // 偏好写不进去不该阻止开局；这一局照常用内存里的值。
  }
}

export function resetHostingPreferences() {
  window.localStorage.removeItem(hostingPreferencesStorageKey)
  return defaultHostingPreferences
}

/** 记下这次的选择，同时把「问过了」标上。 */
export function rememberHostingChoice(mode: HostingMode) {
  saveHostingPreferences({ defaultHostingMode: mode, hasCompletedFirstRunChoice: true })
}
