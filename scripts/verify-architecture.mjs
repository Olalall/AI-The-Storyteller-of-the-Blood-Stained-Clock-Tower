import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const failures = []
const designDoc = 'dev-docs/DUAL_MODE_GRIMOIRE_DESIGN_2026-08-04.md'
const budgets = [
  { pattern: /src[\\/](main|App)\.tsx$/, max: 120, label: '入口文件' },
  { pattern: /src[\\/]components[\\/]ui[\\/].*\.tsx$/, max: 220, label: '共享UI组件' },
  { pattern: /src[\\/]features[\\/].*\.tsx$/, max: 320, label: '业务组件' },
  { pattern: /index\.html$/, max: 180, label: '入口HTML' },
]

const sourceFile = /\.(ts|tsx|js|jsx|mjs|cjs)$/

// localStorage key 的唯一登记处。放在守门脚本内而不是 src 下的常量文件，理由有三：
// 白名单要同时覆盖 server/（src 常量文件对它是错误的家）；它是 CI 策略而非运行时数据，
// 放进 src 会为了 CI 往产物里塞一个模块；本脚本既有策略（预算表、禁用符号表）也都内联。
const localStorageKeyAllowlist = [
  { key: 'botc-copilot-session-v1', owner: 'src/features/game-session/data/createPrototypeSession.ts', why: '当前对局唯一真值' },
  { key: 'botc-copilot-session-recovery-v1', owner: 'src/services/session/localSessionAdapter.ts', why: 'P0 批：加载失败时的原始字符串留档' },
  { key: 'botc-game-archives-v1', owner: 'src/services/archive/localArchiveAdapter.ts', why: '归档列表' },
  { key: 'botc-copilot-ai-settings-v1', owner: 'src/services/settings/localAISettingsAdapter.ts', why: 'AI 设置' },
  { key: 'botc-copilot-archive-runtime-settings-v1', owner: 'src/services/archive/archiveRuntimeSettings.ts', why: '归档后端地址' },
  { key: 'botc-copilot-last-roster-v1', owner: 'src/features/setup/setupRosterMemory.ts', why: '上一局名单记忆' },
  { key: 'botc-copilot-opening-script-v1', owner: 'src/services/opening-script/localOpeningScriptAdapter.ts', why: '开场白前缀，实际 key 追加 sessionId' },
  { key: 'botc-identity-deal-receipts-v1:', owner: 'src/services/identity-deal/localIdentityDealAdapter.ts', why: '发身份回执前缀，实际 key 追加 sessionId' },
  { key: 'botc-copilot-ui:{}:discussion-timer:v3', owner: 'src/services/timer/localDiscussionTimerAdapter.ts', why: '讨论计时器，{} 为 sessionId' },
  { key: 'botc-copilot-day-timer-v1', owner: 'src/services/timer/localDiscussionTimerAdapter.ts', why: '历史遗留，只读迁移' },
  { key: 'botc-copilot-day-timer-v2', owner: 'src/services/timer/localDiscussionTimerAdapter.ts', why: '历史遗留，只读迁移' },
  { key: 'botc-copilot-night-prototype-v5', owner: 'src/features/night-workbench/data/initialNightWorkbenchState.ts', why: '历史遗留，加载时一次性迁移后删除' },
]
const allowedStorageKeys = new Set(localStorageKeyAllowlist.map((entry) => entry.key))

function toPosix(value) {
  return value.replaceAll('\\', '/')
}

// 只解析相对说明符；本仓没有路径别名，裸说明符一律视为第三方包。
function resolveSpecifier(fromFile, specifier) {
  if (!specifier.startsWith('.')) return null
  return toPosix(path.relative(root, path.resolve(path.dirname(fromFile), specifier)))
}

function importSpecifierOf(line) {
  const staticImport = /(?:^|[\s;])(?:import|export)\b[^;\n]*?\bfrom\s*['"]([^'"]+)['"]/.exec(line)
  if (staticImport) return staticImport[1]
  const sideEffect = /(?:^|[\s;])import\s*['"]([^'"]+)['"]/.exec(line)
  if (sideEffect) return sideEffect[1]
  const dynamic = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/.exec(line)
  if (dynamic) return dynamic[1]
  return null
}

// 行内豁免：`// arch-allow: <规则名> <原因>`，写在违规行末尾或紧邻的上一行。
// 原因必填——没有原因的豁免会变成第二个失败项，而不是静默放行。
const exemptionPattern = /arch-allow:\s*([A-Za-z0-9-]+)\s*(.*)$/

function readExemption(line) {
  if (line === undefined) return null
  const matched = exemptionPattern.exec(line)
  if (!matched) return null
  return { id: matched[1], reason: matched[2].replace(/\*\/\s*$/, '').trim() }
}

const rules = [
  {
    id: 'legacy-engine-symbols',
    docSection: '「架构守护：verify-architecture.mjs 现状盘点」要求 2（范围扩到 src|server）',
    applies: (file) => /^(src|server)\/.*\.(ts|tsx)$/.test(file),
    detect: (line) => {
      const matched = /PhaseCoordinator|RuleAutomation|AutonomousGameRunner|AbilityEngine/.exec(line)
      return matched ? `出现旧规则引擎符号 ${matched[0]}` : null
    },
    fix: '删除该符号；若只是说明性文字，改写措辞或在该行加 `// arch-allow: legacy-engine-symbols <原因>`。',
  },
  {
    id: 'ui-night-coupling',
    docSection: '「架构守护：verify-architecture.mjs 现状盘点」检查 3（冲突 5 裁决：本规则一字不改）',
    applies: (file) => /^src\/components\/ui\/.*\.tsx$/.test(file),
    detect: (line) => {
      const matched = /night-workbench|activeCursorId|roleId/.exec(line)
      return matched ? `共享UI组件耦合夜间业务状态 ${matched[0]}` : null
    },
    fix: 'src/components/ui 是零业务耦合层：把带 seatId/roleId 的座位组件放进 src/features/（魔典座位放 src/features/grimoire/）。',
  },
  {
    id: 'ai-script-hardcode',
    docSection: '「架构守护：verify-architecture.mjs 现状盘点」检查 4',
    applies: (file) => file === 'src/services/ai/localAIAdapter.ts',
    detect: (line) => (
      /createCatfishingPrototypeCandidates|scriptId\s*!==\s*['"]catfishing['"]|scriptId\s*===\s*['"]catfishing['"]/.test(line)
        ? 'AI setup candidates 出现按剧本 id 的硬编码分支'
        : null
    ),
    fix: '改走通用 SmartScriptPack 流水线，不得按 scriptId 分叉。',
  },
  {
    id: 'state-no-ai-import',
    docSection: '「为魔典模式新增的 9 条反规则引擎自动检查」P0-1：AI 不得直连权威状态',
    applies: (file) => /^src\/features\/[^/]+\/state\/.*\.(ts|tsx)$/.test(file),
    detect: (line, { file }) => {
      const specifier = importSpecifierOf(line)
      if (!specifier) return null
      const resolved = resolveSpecifier(file, specifier)
      const target = resolved ?? specifier
      if (/(^|\/)src\/services\/ai(\/|$)/.test(`/${target}`)) return `reducer/state 目录 import 了 services/ai（${specifier}）`
      if (/(^|\/)src\/features\/ai-[^/]+/.test(`/${target}`)) return `reducer/state 目录 import 了 features/ai-* （${specifier}）`
      return null
    },
    fix: 'AI 结果只能由组件层取到后作为 action payload 传进 reducer（参考 nightWorkbenchReducer 的 apply-ai-advice），state 目录不得反向依赖 services/ai。',
  },
  {
    id: 'pack-no-session-state',
    docSection: '「为魔典模式新增的 9 条反规则引擎自动检查」P0-2：角色包必须是纯数据',
    applies: (file) => /^src\/domain\/(scripts\/packs|role-knowledge)\/.*\.(ts|tsx)$/.test(file),
    detect: (line, { file }) => {
      if (/(=>|:)\s*(Promise<\s*)?GameSessionState\b/.test(line)) return '出现返回 GameSessionState 的函数签名'
      const specifier = importSpecifierOf(line)
      if (specifier) {
        const target = resolveSpecifier(file, specifier) ?? specifier
        if (/(^|\/)src\/features\/game-session(\/|$)/.test(`/${target}`)) return `角色包 import 了 features/game-session（${specifier}）`
      }
      if (/\bGameSessionState\b/.test(line)) return '角色包引用了 GameSessionState'
      return null
    },
    fix: '角色包与角色知识必须是纯数据/纯函数：需要局面信息时由调用方投影成入参传入，不得反向依赖 GameSessionState。',
  },
]

const ruleIds = new Set(rules.map((rule) => rule.id))

function reportFailure(rule, file, lineNumber, detail) {
  failures.push([
    `[${rule.id}] ${file}:${lineNumber} ${detail}`,
    `  依据: ${designDoc} ${rule.docSection}`,
    `  修复: ${rule.fix}`,
  ].join('\n'))
}

function checkLineRules(file, lines) {
  const applicable = rules.filter((rule) => rule.applies(file))
  // 豁免注释的卫生检查只在规则真正生效的文件里跑，否则本脚本自身的错误提示文案会自我命中。
  if (!applicable.length) return
  const usedExemptions = new Set()
  for (const rule of applicable) {
    lines.forEach((line, index) => {
      const detail = rule.detect(line, { file })
      if (!detail) return
      const exemption = readExemption(line) ?? readExemption(lines[index - 1])
      if (exemption && exemption.id === rule.id) {
        const exemptionLine = readExemption(line) ? index : index - 1
        usedExemptions.add(exemptionLine)
        if (!exemption.reason) {
          failures.push([
            `[arch-allow] ${file}:${exemptionLine + 1} 豁免注释缺少原因`,
            `  依据: ${designDoc} 「架构守护：verify-architecture.mjs 现状盘点」要求 1`,
            '  修复: 写成 `// arch-allow: <规则名> <为什么这里必须违反>`。',
          ].join('\n'))
        }
        return
      }
      reportFailure(rule, file, index + 1, detail)
    })
  }

  lines.forEach((line, index) => {
    const exemption = readExemption(line)
    if (!exemption) return
    if (!ruleIds.has(exemption.id)) {
      failures.push([
        `[arch-allow] ${file}:${index + 1} 未知的规则名 ${exemption.id}`,
        `  依据: ${designDoc} 「架构守护：verify-architecture.mjs 现状盘点」要求 1`,
        `  修复: 规则名只能取 ${[...ruleIds].join(' / ')}。`,
      ].join('\n'))
      return
    }
    if (usedExemptions.has(index)) return
    failures.push([
      `[arch-allow] ${file}:${index + 1} 豁免已失效（该规则在此处没有命中）`,
      `  依据: ${designDoc} 「架构守护：verify-architecture.mjs 现状盘点」要求 1`,
      '  修复: 删掉这条 arch-allow，豁免不留库存。',
    ].join('\n'))
  })
}

// 去掉下划线后再判名，好让 SNAPSHOT_STORAGE_KEY 与 snapshotStorageKey 走同一条路。
const isStorageKeyIdentifier = (name) => /(?:storage|memory)(?:key|prefix)$/i.test(name.replaceAll('_', ''))
const literalPattern = /(['"`])((?:[^\\`'"]|\\.)*)\1/g

function normalizeKeyLiteral(raw) {
  return raw.replaceAll(/\$\{[^}]*\}/g, '{}')
}

// 只在「确定是存储 key」的语法位置取字面量，避免把 tmpdir 前缀、服务名之类的 botc- 字符串误判成 key。
function collectStorageKeys(lines) {
  const found = new Map()
  const record = (raw, index) => {
    const key = normalizeKeyLiteral(raw)
    if (!/[A-Za-z0-9]/.test(key.replaceAll('{}', ''))) return
    if (!found.has(key)) found.set(key, index + 1)
  }

  lines.forEach((line, index) => {
    const direct = /(?:window\.)?localStorage\.(?:get|set|remove)Item\(\s*(['"`])((?:[^\\`'"]|\\.)*)\1/g
    for (const matched of line.matchAll(direct)) record(matched[2], index)

    const declaration = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(['"`])((?:[^\\`'"]|\\.)*)\2/g
    for (const matched of line.matchAll(declaration)) {
      if (isStorageKeyIdentifier(matched[1])) record(matched[3], index)
    }

    if (!/\bfunction\s+[A-Za-z_$][\w$]*(?:StorageKey|StoragePrefix|MemoryKey)\s*\(/.test(line)) return
    for (let ahead = index + 1; ahead < Math.min(lines.length, index + 11); ahead += 1) {
      if (!/\breturn\b/.test(lines[ahead])) continue
      for (const matched of lines[ahead].matchAll(literalPattern)) record(matched[2], ahead)
      break
    }
  })

  return found
}

function checkStorageKeys(file, lines) {
  for (const [key, lineNumber] of collectStorageKeys(lines)) {
    if (allowedStorageKeys.has(key)) continue
    failures.push([
      `[localstorage-key-allowlist] ${file}:${lineNumber} 未登记的 localStorage key「${key}」`,
      `  依据: ${designDoc} 「为魔典模式新增的 9 条反规则引擎自动检查」P0-3：单一持久化真值`,
      '  修复: 若确实需要新 key，把它连同 owner 与用途加进 scripts/verify-architecture.mjs 的 localStorageKeyAllowlist；否则复用既有 key。',
    ].join('\n'))
  }
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.git', 'artifacts'].includes(entry.name)) return []
      return walk(target)
    }
    return [target]
  })
}

for (const file of walk(root)) {
  const relative = path.relative(root, file)
  const normalized = toPosix(relative)
  const budget = budgets.find((candidate) => candidate.pattern.test(relative))
  const text = fs.readFileSync(file, 'utf8')
  if (budget) {
    const lines = text.split(/\r?\n/).length
    if (lines > budget.max) failures.push(`${budget.label}超预算: ${normalized} ${lines}/${budget.max}`)
  }
  if (!sourceFile.test(normalized)) continue
  const lines = text.split(/\r?\n/)
  checkLineRules(normalized, lines)
  if (/^(src|server)\//.test(normalized)) checkStorageKeys(normalized, lines)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Architecture verification passed: entry/component budgets, anti-engine boundaries, state/pack dependency direction and the localStorage key allowlist are clean.')
