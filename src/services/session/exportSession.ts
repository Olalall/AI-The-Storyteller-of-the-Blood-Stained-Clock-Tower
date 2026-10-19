/**
 * 把当前这一局原样导出成 JSON。
 *
 * 与「归档」是两条完全不同的路：归档是一局**打完之后**的正式落库，会经过校验、
 * 可能要连后端、还会进战绩列表。这条路什么都不做，只把此刻的 session 原样写成文件。
 *
 * 它必须在任何时刻都能用，包括——尤其是——一局打到一半、后端连不上、
 * 或者刚看见「存档读不出」的时候。耐久性闸门要求「导出 JSON 提到常驻可达」，
 * 说的就是它不能再藏在「收尾 → 先存一份归档」后面：那条路在最需要它的时刻恰好走不通。
 */
import type { GameSessionState } from '../../features/game-session/types'

/** 唯一的下载实现。此前 GameEndSheet 与 SessionRecoveryNotice 各写了一份，行为已经开始分叉。 */
export function downloadTextFile(filename: string, content: string, mimeType = 'application/json;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** 文件名带对局 id 与时间戳：说书人一晚上可能导出好几次，重名会让「哪份是新的」无从判断。 */
export function sessionExportFilename(session: GameSessionState, now: string): string {
  return `botc-session-${session.id}-${now.replace(/[:.]/g, '-')}.json`
}

export function exportSessionJson(session: GameSessionState, now = new Date().toISOString()) {
  // 缩进两格：这份文件的用途之一是出问题时人来读，压缩掉换行会让它没法看。
  downloadTextFile(sessionExportFilename(session, now), JSON.stringify(session, null, 2))
}
