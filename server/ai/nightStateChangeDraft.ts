/**
 * 把模型返回的 stateChangeDrafts 收成结构化建议。
 *
 * 这是模型自由文本变成「屏幕上一个可点的落盘按钮」的第一道关卡，默认方向只有一个：
 * **看不懂就降级，不猜**。看不懂一句话最多损失一个按钮；猜错一个座位号会让说书人
 * 一键把中毒记在无辜的人头上，而记录上写着这是他自己按的确认。
 *
 * 前端 src/services/ai/aiStateChangeDraft.ts 有一份同判据的实现。两份都要：
 * 这一份挡的是模型输出，那一份挡的是「后端返回的东西不一定是这个后端返回的」
 * （旧版本、代理、离线降级都会走那条路）。谁也不能替谁把关。
 */
import type {
  NightSettlementProviderRequest,
  NightSettlementStateChangeDraft,
  NightSettlementStateChangeField,
  NightSettlementStateChangeProposal,
} from './types'

/**
 * 每个字段允许的 `to` 取值。用白名单而不是「非空即可」：
 * 模型写 `to: '中毒'` 时，宽松解析会造出一条谁也不知道该写 true 还是 false 的建议，
 * 而它在界面上和一条合法建议长得一模一样。
 */
const allowedTargets: Record<NightSettlementStateChangeField, readonly string[]> = {
  life: ['alive', 'dead'],
  poisoned: ['true', 'false'],
  drunk: ['true', 'false'],
  marker: ['add', 'remove'],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function trimmed(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function isField(value: unknown): value is NightSettlementStateChangeField {
  return value === 'life' || value === 'poisoned' || value === 'drunk' || value === 'marker'
}

/**
 * 本次请求里真的出现过的座位号：发动者、已选目标、已展开状态的目标。
 *
 * playerCount 故意不参与——它只说明这局有几个人，不说明模型见过谁。
 * 用 playerCount 当白名单等于允许模型对一个它从没收到过任何信息的座位提状态建议，
 * 那不是建议，是编造，而编出来的句子读起来和真建议没有区别。
 */
export function seatIdsInRequest(input: NightSettlementProviderRequest): Set<number> {
  const seats = new Set<number>([input.wakeItem.seatId])
  for (const seatId of input.draft.targets) seats.add(seatId)
  for (const target of input.selectedTargets ?? []) seats.add(target.seatId)
  return seats
}

/**
 * 解析 change 子对象。任何一处不合规都返回 undefined（= 降级成纯文本），
 * 而不是「尽量修复」：修复出来的建议会带着一个说书人从没同意过的字段值走到落盘按钮上。
 */
function readChange(value: unknown): NightSettlementStateChangeProposal | undefined {
  if (!isRecord(value)) return undefined
  if (!isField(value.field)) return undefined
  const to = trimmed(value.to)
  if (!allowedTargets[value.field].includes(to)) return undefined
  const markerLabel = trimmed(value.markerLabel)
  // marker 没有 label 就不知道贴的是什么；非 marker 却带 label 说明模型串了字段，两种都不可信。
  if (value.field === 'marker' ? !markerLabel : Boolean(markerLabel)) return undefined
  return value.field === 'marker'
    ? { field: 'marker', to, markerLabel }
    : { field: value.field, to }
}

/**
 * @param limit 与既有 stringArray(…, 5) 保持一致，别让结构化建议顺手放宽条数。
 */
export function normalizeStateChangeDrafts(
  value: unknown,
  allowedSeatIds: ReadonlySet<number>,
  limit = 5,
): NightSettlementStateChangeDraft[] {
  if (!Array.isArray(value)) return []
  const drafts: NightSettlementStateChangeDraft[] = []

  for (const raw of value) {
    if (drafts.length >= limit) break
    // 模型很可能仍按旧 outputShape 返回纯字符串数组；按纯文本收下比整批丢掉更接近「降级」。
    if (typeof raw === 'string') {
      const text = raw.trim()
      if (text) drafts.push({ text })
      continue
    }
    if (!isRecord(raw)) continue
    const text = trimmed(raw.text)
    if (!text) continue
    if (raw.seatId === undefined || raw.seatId === null) {
      drafts.push({ text })
      continue
    }
    // 座位号不在白名单里就**整条丢弃**而不是降级：留下文本会在屏幕上留一句
    // 「给 7 号加中毒」，而 7 号这一步根本没被提到。
    if (typeof raw.seatId !== 'number' || !Number.isInteger(raw.seatId) || !allowedSeatIds.has(raw.seatId)) continue
    const change = readChange(raw.change)
    drafts.push(change ? { text, seatId: raw.seatId, change } : { text, seatId: raw.seatId })
  }

  return drafts
}

/** 纯文本建议的构造口。兜底草稿没有模型输出可解析，只能走这里，绝不自造 seatId / change。 */
export function textStateChangeDrafts(texts: readonly string[], limit = 5): NightSettlementStateChangeDraft[] {
  return texts
    .map((text) => text.trim())
    .filter(Boolean)
    .slice(0, limit)
    .map((text) => ({ text }))
}
