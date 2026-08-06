/**
 * 把模型返回的 stateChangeDrafts 收成结构化建议。
 *
 * 这里是「AI 的话」变成「屏幕上一个可点的按钮」之前唯一的关卡，所以它的默认方向
 * 只有一个：**看不懂就降级，不猜**。看不懂一句话最多损失一个按钮，猜错一个座位号
 * 会让说书人一键把毒记在无辜的人头上，而记录上还写着这是他自己按的。
 */
import type { AIStateChangeDraft, AIStateChangeField } from '../../features/night-workbench/types'

/**
 * 每个字段允许的 `to` 取值。白名单而不是「非空即可」：
 * 模型写 `to: '中毒'` 时，宽松解析会造出一个谁也不知道该写成 true 还是 false 的建议，
 * 而它长得和合法建议一模一样。
 */
const allowedTargets: Record<AIStateChangeField, readonly string[]> = {
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

function isField(value: unknown): value is AIStateChangeField {
  return value === 'life' || value === 'poisoned' || value === 'drunk' || value === 'marker'
}

/**
 * 解析 change 子对象。任何一处不合规都返回 undefined（= 降级成纯文本），
 * 而不是「尽量修复」：修复出来的建议会带着一个说书人从没同意过的字段值落盘。
 */
function readChange(value: unknown): AIStateChangeDraft['change'] {
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
 * @param allowedSeatIds 本次请求 input 里出现过的座位号。座位号不在其中的建议**整条丢弃**：
 *   保留文本会在屏幕上留下一句「给 7 号加中毒」，而 7 号这一步根本没被提到——
 *   那是模型在编，编出来的句子读起来和真建议没有区别。
 * @param limit 上限，与既有 stringArray(…, 5) 保持一致。
 */
export function normalizeStateChangeDrafts(
  value: unknown,
  allowedSeatIds: Iterable<number>,
  limit = 5,
): AIStateChangeDraft[] {
  if (!Array.isArray(value)) return []
  const seats = new Set(allowedSeatIds)
  const drafts: AIStateChangeDraft[] = []

  for (const raw of value) {
    if (drafts.length >= limit) break
    // 旧后端仍可能直接返回字符串数组；按纯文本收下，比整批丢掉更接近「降级」的本意。
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
    if (typeof raw.seatId !== 'number' || !Number.isInteger(raw.seatId) || !seats.has(raw.seatId)) continue
    const change = readChange(raw.change)
    drafts.push(change ? { text, seatId: raw.seatId, change } : { text, seatId: raw.seatId })
  }

  return drafts
}

/** 纯文本建议的构造口。本地降级路径没有模型可解析，只能走这里，绝不自造 seatId / change。 */
export function textStateChangeDrafts(texts: readonly string[], limit = 5): AIStateChangeDraft[] {
  return texts
    .map((text) => text.trim())
    .filter(Boolean)
    .slice(0, limit)
    .map((text) => ({ text }))
}
