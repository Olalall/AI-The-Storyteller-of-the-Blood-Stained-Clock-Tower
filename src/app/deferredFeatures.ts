import type { PublicChatTimerPage as PublicChatTimerPageComponent } from '../features/day-workbench/PublicChatTimerPage'
import type { DayWorkbench as DayWorkbenchComponent } from '../features/day-workbench/DayWorkbench'
import type { NightWorkbench as NightWorkbenchComponent } from '../features/night-workbench/NightWorkbench'
import type { BeginnerTutorialSheet as BeginnerTutorialSheetComponent } from '../features/tutorial/BeginnerTutorialSheet'
import type { ScriptLibrarySheet as ScriptLibrarySheetComponent } from '../features/script-library/ScriptLibrarySheet'
import type { GameEndSheet as GameEndSheetComponent } from '../features/game-end/GameEndSheet'
import type { IdentityDealSheet as IdentityDealSheetComponent } from '../features/identity-deal/IdentityDealSheet'
import type { SetupPanel as SetupPanelComponent } from '../features/setup/SetupPanel'
import type { RulesAdvisorSheet as RulesAdvisorSheetComponent } from '../features/rules-advisor/RulesAdvisorSheet'
import type { ComponentProps } from 'react'
import { deferredPanel, deferredView } from './deferredFeature'

export const RulesAdvisorSheet = deferredPanel<ComponentProps<typeof RulesAdvisorSheetComponent>>('钟楼搭档', () => import('../features/rules-advisor/RulesAdvisorSheet').then(module => ({ default: module.RulesAdvisorSheet })))

export const SetupPanel = deferredPanel<ComponentProps<typeof SetupPanelComponent>>('智能配板与调整', () => import('../features/setup/SetupPanel').then((module) => ({ default: module.SetupPanel })))
export const IdentityDealSheet = deferredPanel<ComponentProps<typeof IdentityDealSheetComponent>>('发身份', () => import('../features/identity-deal/IdentityDealSheet').then((module) => ({ default: module.IdentityDealSheet })))
export const GameEndSheet = deferredPanel<ComponentProps<typeof GameEndSheetComponent>>((props) => props.initialMode === 'reset' ? '重置游戏' : props.initialMode === 'review' ? '历史复盘' : '保存本局', () => import('../features/game-end/GameEndSheet').then((module) => ({ default: module.GameEndSheet })))
export const ScriptLibrarySheet = deferredPanel<ComponentProps<typeof ScriptLibrarySheetComponent>>('切换板子', () => import('../features/script-library/ScriptLibrarySheet').then((module) => ({ default: module.ScriptLibrarySheet })))
export const BeginnerTutorialSheet = deferredPanel<ComponentProps<typeof BeginnerTutorialSheetComponent>>('新手教程', () => import('../features/tutorial/BeginnerTutorialSheet').then((module) => ({ default: module.BeginnerTutorialSheet })))
export const NightWorkbench = deferredView<ComponentProps<typeof NightWorkbenchComponent>>('夜间工作台', () => import('../features/night-workbench/NightWorkbench').then((module) => ({ default: module.NightWorkbench })))
export const DayWorkbench = deferredView<ComponentProps<typeof DayWorkbenchComponent>>('白天工作台', () => import('../features/day-workbench/DayWorkbench').then((module) => ({ default: module.DayWorkbench })))
export const PublicChatTimerPage = deferredView<ComponentProps<typeof PublicChatTimerPageComponent>>('公聊倒计时', () => import('../features/day-workbench/PublicChatTimerPage').then((module) => ({ default: module.PublicChatTimerPage })))
