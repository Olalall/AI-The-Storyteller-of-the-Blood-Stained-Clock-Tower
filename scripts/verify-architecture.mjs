import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const failures = []
// 报警项不影响退出码：第 0 批只冻结增量，存量另行清理。
const warnings = []
const verbose = process.argv.includes('--verbose')
const designDoc = 'dev-docs/DUAL_MODE_GRIMOIRE_DESIGN_2026-08-04.md'
const redesignDoc = 'dev-docs/UI_REDESIGN_PLAN_2026-08-04.md'
const designSystemDoc = 'dev-docs/ui-design-system.md'
const budgets = [
  { pattern: /src[\\/](main|App)\.tsx$/, max: 120, label: '入口文件' },
  { pattern: /src[\\/]components[\\/]ui[\\/].*\.tsx$/, max: 220, label: '共享UI组件' },
  { pattern: /src[\\/]features[\\/].*\.tsx$/, max: 320, label: '业务组件' },
  { pattern: /index\.html$/, max: 180, label: '入口HTML' },
]

const sourceFile = /\.(ts|tsx|js|jsx|mjs|cjs)$/
const styleFile = /^src\/.*\.css$/
// 类名引用面：tsx/ts 拼 className，index.html 里也直接写死了几个骨架类。
const classReferenceFile = /\.(tsx|ts|html)$/

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
  { key: 'botc-copilot-session-snapshot-v1', owner: 'src/services/session/snapshotRotation.ts', why: '耐久性闸门：快照槽前缀，实际 key 追加槽号' },
  { key: 'botc-copilot-session-snapshot-v1-index', owner: 'src/services/session/snapshotRotation.ts', why: '耐久性闸门：快照索引。它不是第二份真值，主副本始终权威' },
  { key: 'botc-copilot-session-lock-v1', owner: 'src/services/session/instanceLock.ts', why: '耐久性闸门：单实例锁，防第二个标签页整份覆盖存档' },
  { key: 'botc-copilot-hosting-preferences-v1', owner: 'src/services/settings/hostingPreferences.ts', why: '新局默认模式偏好。只是初值来源，运行时真值永远是 session.hostingMode' },
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

// 注释整体替换成等长空白：检测不再命中注释里的示例代码，行号与 arch-allow 的对齐关系也原样保留。
function blankCssComments(text) {
  return text.replaceAll(/\/\*[\s\S]*?\*\//g, (block) => block.replaceAll(/[^\n]/g, ' '))
}

const cssVarDefinitionPattern = /(?:^|[\s;{])(--[A-Za-z0-9_-]+)\s*:/g

function collectCssVarDefinitions(text) {
  return new Set([...text.matchAll(cssVarDefinitionPattern)].map((matched) => matched[1]))
}

// 按花括号深度切选择器，而不是按行正则：本仓 CSS 大量写成单行规则，也有 @media/@container 嵌套。
function collectCssSelectors(text) {
  const selectors = []
  let buffer = ''
  let line = 1
  let startLine = 1
  for (const character of text) {
    if (character === '{') {
      const selector = buffer.trim()
      if (selector && !selector.startsWith('@')) selectors.push({ selector, line: startLine })
      buffer = ''
    } else if (character === '}') {
      buffer = ''
    } else if (buffer !== '' || !/\s/.test(character)) {
      buffer += character
    }
    if (character === '\n') line += 1
    if (buffer === '') startLine = line
  }
  return selectors
}

const classInSelectorPattern = /\.(-?[A-Za-z_][\w-]*)/g

// 类名引用判定刻意保守：宁可漏报也不要误报，否则报警清单会被动态拼接的类淹没。
// 1) 整词出现即算引用（词边界按 [A-Za-z0-9_-] 切，故 game-end__reset 不会被 game-end__reset-body 顶掉）；
// 2) BEM 修饰符只要 tsx 里出现过 `<基类>--` 这个前缀，就当成模板字符串拼接过；
// 3) is-/has- 状态类整类跳过——SetupPanel 的 `is-${check.status}` 这类写法无法静态还原。
const dynamicStateClass = /^(?:is|has)-/

function isClassReferenced(name, index) {
  if (dynamicStateClass.test(name)) return true
  if (index.words.has(name)) return true
  const modifier = name.lastIndexOf('--')
  return modifier > 0 && index.text.includes(`${name.slice(0, modifier)}--`)
}

function buildClassReferenceIndex(files) {
  const text = files
    .filter((file) => classReferenceFile.test(file) && !file.endsWith('.d.ts'))
    .map((file) => fs.readFileSync(path.join(root, file), 'utf8'))
    .join('\n')
  return { text, words: new Set([...text.matchAll(/[A-Za-z0-9_-]+/g)].map((matched) => matched[0])) }
}

function buildCssContext(text, classIndex, tokenVars) {
  const source = blankCssComments(text)
  const stripped = source.split(/\r?\n/)
  const localVars = collectCssVarDefinitions(source)
  const orphanByLine = new Map()
  const seen = new Set()
  for (const { selector, line } of collectCssSelectors(source)) {
    for (const matched of selector.matchAll(classInSelectorPattern)) {
      const name = matched[1]
      if (seen.has(name)) continue
      seen.add(name)
      if (isClassReferenced(name, classIndex)) continue
      if (!orphanByLine.has(line)) orphanByLine.set(line, [])
      orphanByLine.get(line).push(name)
    }
  }
  return { stripped, localVars, tokenVars, orphanByLine }
}

// 8/14/22 来自 ui-design-system.md:13，999 是药丸（tokens.css 里唯一获批的例外），0 是「取消圆角」。
const allowedRadiusPx = new Set([0, 8, 14, 22, 999])
const cssLengthPattern = /(-?\d*\.?\d+)(px|rem|em)\b/g

function offscaleRadiusValues(value) {
  return [...value.matchAll(cssLengthPattern)]
    .filter((matched) => !allowedRadiusPx.has(matched[2] === 'px' ? Number(matched[1]) : Number(matched[1]) * 16))
    .map((matched) => matched[0])
}

const keywordFontSize = /^(?:inherit|unset|initial|revert|0)$/

function declarationValues(source, property) {
  const pattern = new RegExp(String.raw`(?:^|[;{\s])${property}\s*:\s*([^;}]+)`, 'g')
  return [...source.matchAll(pattern)].map((matched) => matched[1].trim().replace(/\s*!important$/, ''))
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
    id: 'hosting-preferences-not-runtime',
    docSection: '「模式归属：每局冻结 + 全局默认」：运行时任何地方读模式都只读 session.hostingMode，不读偏好',
    // 偏好文件自身、它的测试、以及 App 层建局处除外。
    applies: (file) => /^src\/.*\.(ts|tsx)$/.test(file)
      && !/^src\/services\/settings\/hostingPreferences\./.test(file)
      && !/^src\/app\//.test(file),
    detect: (line, { file }) => {
      const specifier = importSpecifierOf(line)
      if (!specifier) return null
      const target = resolveSpecifier(file, specifier) ?? specifier
      if (!/hostingPreferences/.test(target)) return null
      return '这里 import 了 hostingPreferences——偏好只是新局初值来源，读它做运行时判断会让「这一局是什么模式」出现第二个真相源'
    },
    fix: '运行时读模式一律用 session.hostingMode。需要默认值时，让 App 层在建局那一次把它作为参数传下来。',
  },
  {
    id: 'hosting-mode-not-behavioural',
    docSection: '「模式字段的归属（作者已拍板）」：记录它发生过，但永不让它成为分支条件',
    applies: (file) => /^src\/features\/[^/]+\/state\/.*\.(ts|tsx)$/.test(file) && !/\.test\./.test(file),
    detect: (line) => {
      // 说明性文字必须能写出这个字段名——否则规则会逼着作者不去解释它为什么存在。
      if (/^\s*(\/\/|\/\*|\*)/.test(line)) return null
      // 查的是「读」，不是「字段名出现」：
      //   写入 `hostingMode: action.mode` 是留痕，它就发生在唯一的写入点里；
      //   读取 `state.hostingMode` 才是模式即将变成分支条件的那一步。
      // History 单独放行：归档要按时间轴回放模式变更，那是展示不是分支。
      const readsField = /[.?]\s*hostingMode\b(?!History)/.test(line)
      const destructures = /\b(?:const|let|var)\s*\{[^}]*\bhostingMode\b(?!History)/.test(line)
      if (!readsField && !destructures) return null
      return 'state 目录读取了 hostingMode——模式一旦成为行为分支，两套数据模型就会长出来'
    },
    fix: 'hostingMode 只是出处元数据。视图层可按它选渲染组件，归档/复盘与 AI 上下文可读它做展示，但 reducer 一律不得读；需要差异化行为时请把差异做成显式 action 或 props。',
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
  {
    id: 'css-undefined-var',
    doc: redesignDoc,
    docSection: '「第 0 批（先于一切，纯清理）」CI 守门 1：引用未定义 var 报错',
    applies: (file) => styleFile.test(file),
    detect: (line, { css, index }) => {
      const missing = [...(css.stripped[index] ?? '').matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)]
        .map((matched) => matched[1])
        .filter((name) => !css.tokenVars.has(name) && !css.localVars.has(name))
      return missing.length ? `引用了未定义的 CSS 变量 ${[...new Set(missing)].join(' / ')}` : null
    },
    fix: '含未定义变量的声明是 invalid at computed-value time，会静默塌回初始值。把它就近归并到 src/styles/tokens.css 的现有档位，或（组件作用域变量如 --disc-size）在同一个 CSS 文件里定义默认值；不要新增全局档位。',
  },
  {
    id: 'css-offscale-values',
    severity: 'warn',
    doc: designSystemDoc,
    docSection: '「Token」字号五档（:12）与圆角 8/14/22（:13）；守门条目见 UI_REDESIGN_PLAN_2026-08-04.md 第 0 批 CI 守门 2',
    applies: (file) => styleFile.test(file),
    detect: (line, { css, index }) => {
      const source = css.stripped[index] ?? ''
      const found = []
      for (const value of declarationValues(source, 'font-size')) {
        if (/var\(\s*--type-/.test(value) || keywordFontSize.test(value)) continue
        found.push(`硬编码字号 font-size: ${value}`)
      }
      for (const value of declarationValues(source, 'font')) {
        if (/var\(\s*--type-/.test(value) || keywordFontSize.test(value)) continue
        found.push(`font 简写绕过字号档位 font: ${value}`)
      }
      for (const value of declarationValues(source, String.raw`border(?:-[a-z]+)*-radius`)) {
        const offscale = offscaleRadiusValues(value)
        if (offscale.length) found.push(`圆角越档 ${offscale.join(' / ')}（${value}）`)
      }
      return found.length ? found.join('；') : null
    },
    fix: '字号改用 --type-meta/label/body/section/page-title 五档；圆角改用 --radius-sm(8) / --radius-xl(22) / --radius-pill(999)。确需一次性数值时在该行加 `/* arch-allow: css-offscale-values <原因> */`。',
  },
  {
    id: 'css-orphan-class',
    severity: 'warn',
    doc: redesignDoc,
    docSection: '「第 0 批（先于一切，纯清理）」CI 守门 3：无 tsx 引用的 CSS 类报警',
    applies: (file) => styleFile.test(file),
    detect: (line, { css, index }) => {
      const orphans = css.orphanByLine.get(index + 1)
      return orphans ? `CSS 类在 tsx/ts/html 中零引用: ${orphans.map((name) => `.${name}`).join(' ')}` : null
    },
    fix: '删掉这段样式连同它的响应式覆盖。若类名由 tsx 动态拼接而静态扫不到，在该行加 `/* arch-allow: css-orphan-class <拼接位置> */`。',
  },
]

const ruleIds = new Set(rules.map((rule) => rule.id))
const ruleById = new Map(rules.map((rule) => [rule.id, rule]))

// 报警项与错误项走同一套三行格式，只是落进不同的桶：报警不改退出码。
function bucketOf(rule) {
  return rule?.severity === 'warn' ? warnings : failures
}

function finding({ ruleId, file, lineNumber, detail, doc, docSection, fix }) {
  return {
    ruleId,
    where: `${file}:${lineNumber}`,
    detail,
    doc,
    docSection,
    fix,
    lines: [`[${ruleId}] ${file}:${lineNumber} ${detail}`, `  依据: ${doc} ${docSection}`, `  修复: ${fix}`].join('\n'),
  }
}

function reportFinding(rule, file, lineNumber, detail) {
  bucketOf(rule).push(finding({
    ruleId: rule.id,
    file,
    lineNumber,
    detail,
    doc: rule.doc ?? designDoc,
    docSection: rule.docSection,
    fix: rule.fix,
  }))
}

const exemptionDocSection = '「架构守护：verify-architecture.mjs 现状盘点」要求 1'

// arch-allow 注释本身的卫生问题跟着被豁免规则的 severity 走：报警规则的失效豁免不该把 CI 变红。
function reportExemptionProblem(rule, file, lineNumber, detail, fix) {
  bucketOf(rule).push(finding({
    ruleId: 'arch-allow',
    file,
    lineNumber,
    detail,
    doc: designDoc,
    docSection: exemptionDocSection,
    fix,
  }))
}

function checkLineRules(file, lines, context = {}) {
  const applicable = rules.filter((rule) => rule.applies(file))
  // 豁免注释的卫生检查只在规则真正生效的文件里跑，否则本脚本自身的错误提示文案会自我命中。
  if (!applicable.length) return
  const usedExemptions = new Set()
  for (const rule of applicable) {
    lines.forEach((line, index) => {
      const detail = rule.detect(line, { ...context, file, index })
      if (!detail) return
      const exemption = readExemption(line) ?? readExemption(lines[index - 1])
      if (exemption && exemption.id === rule.id) {
        const exemptionLine = readExemption(line) ? index : index - 1
        usedExemptions.add(exemptionLine)
        if (!exemption.reason) {
          reportExemptionProblem(
            rule,
            file,
            exemptionLine + 1,
            '豁免注释缺少原因',
            '写成 `// arch-allow: <规则名> <为什么这里必须违反>`（CSS 里写成 `/* arch-allow: ... */`）。',
          )
        }
        return
      }
      reportFinding(rule, file, index + 1, detail)
    })
  }

  lines.forEach((line, index) => {
    const exemption = readExemption(line)
    if (!exemption) return
    if (!ruleIds.has(exemption.id)) {
      failures.push(finding({
        ruleId: 'arch-allow',
        file,
        lineNumber: index + 1,
        detail: `未知的规则名 ${exemption.id}`,
        doc: designDoc,
        docSection: exemptionDocSection,
        fix: `规则名只能取 ${[...ruleIds].join(' / ')}。`,
      }))
      return
    }
    if (usedExemptions.has(index)) return
    reportExemptionProblem(
      ruleById.get(exemption.id),
      file,
      index + 1,
      '豁免已失效（该规则在此处没有命中）',
      '删掉这条 arch-allow，豁免不留库存。',
    )
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
    failures.push(finding({
      ruleId: 'localstorage-key-allowlist',
      file,
      lineNumber,
      detail: `未登记的 localStorage key「${key}」`,
      doc: designDoc,
      docSection: '「为魔典模式新增的 9 条反规则引擎自动检查」P0-3：单一持久化真值',
      fix: '若确实需要新 key，把它连同 owner 与用途加进 scripts/verify-architecture.mjs 的 localStorageKeyAllowlist；否则复用既有 key。',
    }))
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

const allFiles = walk(root).map((file) => toPosix(path.relative(root, file)))
// 三条 CSS 纪律都是跨文件判定：token 定义面来自 tokens.css，类名引用面来自全部 tsx/ts/html，先建索引再逐文件扫。
const tokenVars = collectCssVarDefinitions(fs.readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8'))
const classIndex = buildClassReferenceIndex(allFiles)

for (const normalized of allFiles) {
  const budget = budgets.find((candidate) => candidate.pattern.test(normalized))
  const isStyle = styleFile.test(normalized)
  if (!budget && !isStyle && !sourceFile.test(normalized)) continue
  const text = fs.readFileSync(path.join(root, normalized), 'utf8')
  if (budget) {
    const lineCount = text.split(/\r?\n/).length
    if (lineCount > budget.max) {
      failures.push({
        ruleId: 'file-budget',
        where: normalized,
        detail: `${budget.label}超预算 ${lineCount}/${budget.max}`,
        lines: `${budget.label}超预算: ${normalized} ${lineCount}/${budget.max}`,
      })
    }
  }
  const lines = text.split(/\r?\n/)
  if (isStyle) {
    checkLineRules(normalized, lines, { css: buildCssContext(text, classIndex, tokenVars) })
    continue
  }
  if (!sourceFile.test(normalized)) continue
  checkLineRules(normalized, lines)
  if (/^(src|server)\//.test(normalized)) checkStorageKeys(normalized, lines)
}

const warningSampleLimit = 10

function printWarnings() {
  if (!warnings.length) return
  const byRule = new Map()
  for (const warning of warnings) {
    if (!byRule.has(warning.ruleId)) byRule.set(warning.ruleId, [])
    byRule.get(warning.ruleId).push(warning)
  }
  console.warn('')
  console.warn('--- CSS 纪律报警（不影响退出码：本批只冻结增量，存量按 UI_REDESIGN_PLAN 后续批次清理）---')
  for (const [ruleId, entries] of byRule) {
    console.warn(`[${ruleId}] ${entries.length} 行命中`)
    if (verbose) {
      for (const entry of entries) console.warn(entry.lines)
      continue
    }
    // 非 verbose 时把三行格式里两行不变的部分提到分组头，样例只留一行，避免报警淹没错误。
    console.warn(`  依据: ${entries[0].doc} ${entries[0].docSection}`)
    console.warn(`  修复: ${entries[0].fix}`)
    for (const entry of entries.slice(0, warningSampleLimit)) console.warn(`  ${entry.where} ${entry.detail}`)
    if (entries.length > warningSampleLimit) {
      console.warn(`  ……另有 ${entries.length - warningSampleLimit} 行；用 --verbose 看全部`)
    }
  }
}

if (failures.length) {
  console.error(failures.map((failure) => failure.lines).join('\n'))
  printWarnings()
  process.exit(1)
}

console.log('Architecture verification passed: entry/component budgets, anti-engine boundaries, state/pack dependency direction, the localStorage key allowlist and CSS variable definitions are clean.')
printWarnings()
