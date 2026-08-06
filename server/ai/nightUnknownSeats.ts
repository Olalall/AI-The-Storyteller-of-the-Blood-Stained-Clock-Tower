/**
 * contextLevel 在 server 端唯一的落地处。
 *
 * 提示词与 provider 共用这一个模块，是为了让「告诉模型该问什么」和「模型没问时替它问」
 * 用的是同一份座位名单。两边各写一遍的话，提示词改了措辞、provider 还在按旧口径判，
 * 结果就是提示词说要点名、实际点不出名——而这种不一致从响应里看不出来。
 */
import type { NightSettlementProviderRequest } from './types'

/**
 * 本次请求声明「工具知情不全」时，还不知道身份的座位号（升序去重）。
 *
 * 只有**显式** contextLevel === 'minimal' 才返回非空。没带这个字段的请求一律按
 * 「客户端没说」处理：把没说当成不全，会让所有还没升级的客户端突然收到一堆 needs_input，
 * 而后端连该点名哪个座位都说不出来——那是最坏的一种拒答，说书人无从补救。
 */
export function unknownSeatGap(input: NightSettlementProviderRequest): number[] {
  if (input.contextLevel !== 'minimal') return []
  return [...new Set(input.unknownSeatIds ?? [])]
    .filter((seatId) => Number.isInteger(seatId))
    .sort((left, right) => left - right)
}

/**
 * 点名式追问。
 *
 * 「未列出等于未知，不是正常」这条要成立，问句里必须有座位号：只说「信息不全」，
 * 说书人看完既不知道该补什么，也无法判断这次拒答是不是模型在偷懒。
 */
export function unknownSeatQuestion(gap: readonly number[]): string {
  return `工具里还不知道 ${gap.join('、')} 号座位的身份——未列出只代表工具没记录，不代表这些座位一切正常。`
    + '先补录这些座位的身份，或直接告诉我他们是谁。'
}
