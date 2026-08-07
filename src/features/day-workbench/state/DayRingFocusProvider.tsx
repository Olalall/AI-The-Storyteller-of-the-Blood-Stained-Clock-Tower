/**
 * 把环与抽屉罩在同一个白天焦点下。
 *
 * 魔典宿主必须让**画布和抽屉都在这一层里面**——只罩住其中一个等于什么都没做，
 * 环仍然会把座位落进说书人没看着的那个槽。
 *
 * 单独成文件只有一个原因：oxlint 的 only-export-components 要求一个 tsx
 * 要么只导出组件、要么一个组件都不导出。context 与 hook 留在 dayRingFocus.ts。
 */
import type { ReactNode } from 'react'
import { DayRingFocusContext, useLocalDayRingFocus } from './dayRingFocus'

export function DayRingFocusProvider({ children }: { children: ReactNode }) {
  const value = useLocalDayRingFocus()
  return <DayRingFocusContext.Provider value={value}>{children}</DayRingFocusContext.Provider>
}
