/**
 * 工作台的显式状态枚举，取代 isPreviewing / isReadOnly / isCorrecting 三个并列布尔。
 *
 * 为什么要收敛：三个独立布尔有 8 种组合，而每个组件都可以自由地把它们拼成任意条件
 * （`isPreviewing || isReadOnly`、`!isPreviewing && !isCorrecting`、`!isPreviewing && !isReadOnly && !isCorrecting`
 * 在旧代码里同时存在）。魔典还要再叠 replay 态、deal 态、草稿态，组合数继续翻倍，
 * 每加一个态都得回头翻遍所有组件确认没漏。收敛成一个枚举之后，「这一屏现在是什么状态」
 * 只有一个真值，而「这个状态意味着什么」只有下面这一张表。
 *
 * 硬规则（设计文档裁决）：**任何只读态都通过一个 readOnly prop 自上而下强制，
 * 禁止各组件自行判断**。因此 `isReadOnlyMode` 只允许在 hooks/useNightWorkbench 里调用一次，
 * 组件一律接 readOnly prop。归档回看（replay）与发身份（deal）的写入禁用走的是同一条路：
 * 它们由 surface 参数自上而下压下来，压过一切局面状态。
 */
import type { WakeItem } from '../types'

/**
 * 判定 mode 只需要游标的这三个字段。
 *
 * 刻意收窄到结构类型而不是收 `NightWorkbenchState`：魔典的环要和抽屉里那张卡
 * 处在同一个 mode 下（同一个只读闸门、同一枚焦点），而环拿到的是
 * `session.nightRuns[id]`（NightRunState），不是工作台组件内部那份投影。
 * 收宽入参之后两边共用同一个判据；否则环那侧只能再写一份 `previewEntryId !== activeCursorId`，
 * 而这次收敛要消灭的正是「同一个谓词的第二份拷贝」。
 */
export interface WorkbenchCursorState {
  previewEntryId: string
  activeCursorId: string
  correctionItemId: string | null
}

/** 当前这一项：只看得见 id 与 progress，看不见生死毒醉——那些不该参与 mode 判定。 */
export type WorkbenchCursorItem = Pick<WakeItem, 'id' | 'progress'>

/**
 * 自上而下压下来的「这一屏在干什么」。live 之外的两档现在没有任何代码会传，
 * 但枚举与不变量先定：G3 的相位/归档回看是 replay，开局发身份叠加层是 deal，
 * 两者都必须是只读的，而这个只读不能靠各组件自觉——它由 surface 一次性决定。
 */
export type WorkbenchSurface = 'live' | 'replay' | 'deal'

/**
 * 工作台状态。前五个是当前真的会产生的，后三个是给魔典预留的（现在没有生产者）。
 */
export type WorkbenchMode =
  /** 焦点在「正在处理」的那一项上，该项尚未落定：可写，点击直接进草稿。 */
  | 'editing'
  /** 焦点在「正在处理」的那一项上，正在给已确认记录追加更正：可写，写入是追加不是覆盖。 */
  | 'correcting'
  /** 焦点在「正在处理」的那一项上，但该项已落定（已确认 / 已暂缓 / 本夜不适用）：只读。 */
  | 'settled'
  /** 在看别的一项，且那一项尚未落定：只读（预览不写任何东西）。 */
  | 'preview-open'
  /** 在看别的一项，且那一项已落定：只读，且记录预览要显示「已写入」而不是「确认后写入」。 */
  | 'preview-settled'
  /** 预留（G3 3C / 归档回看）：环与卡片降饱和、常驻诚实条、全部写入入口 disabled。 */
  | 'replay'
  /** 预留（发身份叠加层）：强制遮蔽、逐座位揭示，环上不产生任何写入。 */
  | 'deal'
  /** 预留（魔典 G2 草稿/确认两段式）：手势已落草稿、等说书人确认，此时仍然可写。 */
  | 'staging'

/**
 * 一个状态意味着什么。加一个 mode 就必须在这里补齐每一列，漏一列编译不过——
 * 这是防止「又长出第四个布尔」的结构性手段，不是文档。
 */
interface WorkbenchModeFacts {
  /** 唯一的写入闸门。为 true 时这一屏不产生任何 session 写入。 */
  readOnly: boolean
  /** 焦点不在「正在处理」的那一项上（旧 isPreviewing）。 */
  previewing: boolean
  /** 当前这一项已落定：已确认（且未在更正）/ 已暂缓 / 本夜不适用（旧 isReadOnly）。 */
  settled: boolean
  /** 正在给已确认记录追加更正（旧 isCorrecting）。 */
  correcting: boolean
  /** 焦点就在本局「正在处理」的那一项上（live 面、非预览）。换角、展示信息这类只对它开放。 */
  liveFocus: boolean
}

const MODE_FACTS: Record<WorkbenchMode, WorkbenchModeFacts> = {
  editing: { readOnly: false, previewing: false, settled: false, correcting: false, liveFocus: true },
  correcting: { readOnly: false, previewing: false, settled: false, correcting: true, liveFocus: true },
  settled: { readOnly: true, previewing: false, settled: true, correcting: false, liveFocus: true },
  'preview-open': { readOnly: true, previewing: true, settled: false, correcting: false, liveFocus: false },
  'preview-settled': { readOnly: true, previewing: true, settled: true, correcting: false, liveFocus: false },
  // 预留三档：replay / deal 一律只读；staging 是魔典自己的可写草稿态，与夜间工作台无关。
  replay: { readOnly: true, previewing: false, settled: false, correcting: false, liveFocus: false },
  deal: { readOnly: true, previewing: false, settled: false, correcting: false, liveFocus: false },
  staging: { readOnly: false, previewing: false, settled: false, correcting: false, liveFocus: false },
}

/**
 * 收敛前后的逐条对照表。P = 旧 isPreviewing，R = 旧 isReadOnly，C = 旧 isCorrecting。
 *
 * | P | R | C | 含义                                   | UI 可达 | 收敛后 mode      |
 * |---|---|---|----------------------------------------|---------|------------------|
 * | 0 | 0 | 0 | 正在处理当前项，尚未落定               | 是      | editing          |
 * | 0 | 0 | 1 | 正在给当前项的已确认记录追加更正       | 是      | correcting       |
 * | 0 | 1 | 0 | 当前项已确认 / 已暂缓 / 本夜不适用     | 是      | settled          |
 * | 0 | 1 | 1 | —                                      | 否 (a)  | settled（保守）  |
 * | 1 | 0 | 0 | 在预览另一项，那一项尚未落定           | 是      | preview-open     |
 * | 1 | 0 | 1 | —                                      | 否 (b)  | preview-open     |
 * | 1 | 1 | 0 | 在预览另一项，那一项已落定             | 是      | preview-settled  |
 * | 1 | 1 | 1 | —                                      | 否 (b)  | preview-settled  |
 *
 * 五个可达组合与五个 live mode 是一一对应的双射：由 MODE_FACTS 反查 (previewing, settled, correcting)
 * 就能原样还原出三个旧布尔，所以每一处旧条件都能逐条改写成等价式（见各组件改动处的注释）。
 *
 * (b) C ⟹ ¬P：correctionItemId 只在 begin-correction 里被写成 activeCursorId，而所有会移动
 *     activeCursorId 的 action（activate-preview、advanceFrom）都同时把它置回 null，
 *     所以「correctionItemId 非空」恒等于「correctionItemId === activeCursorId」。
 *     于是 C（correctionItemId === current.id）蕴含 current.id === activeCursorId，即 ¬P。
 *     这两行按 P 优先解析，结果与旧代码逐条相同（旧代码在 P 为真时也一律走预览分支、
 *     formDisabled 恒为真、换角与 AI 恒关闭），所以即使有人手搓 dispatch 造出这两种组合，行为也不变。
 *
 * (a) C ⟹ R 为假：begin-correction 要求该项有已确认快照，即 progress 为 'confirmed'；
 *     而 C 为真时 R 的第三个子句（confirmed && correctionItemId !== current.id）恒假。
 *     UI 上「更正中」那一格渲染的是「暂不更正」而不是「稍后处理」，所以 defer 打不到已确认项；
 *     resolve-applicability 只在 applicability 为 needs_review 时出现，而 needs_review 的项
 *     根本确认不了（canEditItem 要求 applicable），因此 confirmed 项不会再变成 deferred / not_applicable。
 *     这一行按 R 优先解析成 settled（只读方向更保守）。它与旧行为的唯一差别是换角开关：
 *     旧式 `!P && !C` 为假，新式 `liveFocus && !correcting` 为真。仅在 UI 不可达的组合上不同，
 *     且偏向「允许换角」而不是「允许写记录」，不扩大任何写入面。
 */
export function deriveWorkbenchMode(
  state: WorkbenchCursorState,
  current: WorkbenchCursorItem,
  surface: WorkbenchSurface = 'live',
): WorkbenchMode {
  // 自上而下压下来的面先于一切局面状态：归档回看里哪怕这一项还没确认，也不许写。
  if (surface === 'replay') return 'replay'
  if (surface === 'deal') return 'deal'
  const previewing = state.previewEntryId !== state.activeCursorId
  const correcting = state.correctionItemId === current.id
  const settled = current.progress === 'deferred'
    || current.progress === 'not_applicable'
    || (current.progress === 'confirmed' && !correcting)
  if (previewing) return settled ? 'preview-settled' : 'preview-open'
  if (settled) return 'settled'
  return correcting ? 'correcting' : 'editing'
}

/**
 * 唯一的只读判据。**只许 hooks/useNightWorkbench 调用一次**，结果作为 readOnly prop 自上而下传；
 * 组件里再调一次就等于把「要不要禁用」的判断权还给了组件，那正是这次收敛要消灭的东西。
 */
export function isReadOnlyMode(mode: WorkbenchMode): boolean {
  return MODE_FACTS[mode].readOnly
}

/** 焦点不在「正在处理」的那一项上。用于预览徽标与预览动作条，不是写入闸门。 */
export function isPreviewMode(mode: WorkbenchMode): boolean {
  return MODE_FACTS[mode].previewing
}

/** 当前这一项已落定。用于「已写入 / 确认后写入」这类文案，不是写入闸门。 */
export function isSettledMode(mode: WorkbenchMode): boolean {
  return MODE_FACTS[mode].settled
}

/** 正在追加更正。用于按钮文案（确认更正 / 暂不更正），不是写入闸门。 */
export function isCorrectionMode(mode: WorkbenchMode): boolean {
  return MODE_FACTS[mode].correcting
}

/** 焦点就在本局「正在处理」的那一项上。预留的 replay / deal / staging 一律为假。 */
export function isLiveFocusMode(mode: WorkbenchMode): boolean {
  return MODE_FACTS[mode].liveFocus
}
