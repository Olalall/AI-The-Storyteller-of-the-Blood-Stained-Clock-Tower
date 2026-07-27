import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const failures = []
const budgets = [
  { pattern: /src[\\/](main|App)\.tsx$/, max: 120, label: '入口文件' },
  { pattern: /src[\\/]components[\\/]ui[\\/].*\.tsx$/, max: 220, label: '共享UI组件' },
  { pattern: /src[\\/]features[\\/].*\.tsx$/, max: 320, label: '业务组件' },
  { pattern: /index\.html$/, max: 180, label: '入口HTML' },
]

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
  const normalized = relative.replaceAll('\\', '/')
  const budget = budgets.find((candidate) => candidate.pattern.test(relative))
  const text = fs.readFileSync(file, 'utf8')
  if (budget) {
    const lines = text.split(/\r?\n/).length
    if (lines > budget.max) failures.push(`${budget.label}超预算: ${normalized} ${lines}/${budget.max}`)
  }
  if (/src\/.*\.(ts|tsx)$/.test(normalized) && /(PhaseCoordinator|RuleAutomation|AutonomousGameRunner|AbilityEngine)/.test(text)) {
    failures.push(`新源码包含旧规则引擎符号: ${normalized}`)
  }
  if (/src\/components\/ui\/.*\.tsx$/.test(normalized) && /night-workbench|activeCursorId|roleId/.test(text)) {
    failures.push(`共享UI组件耦合夜间业务状态: ${normalized}`)
  }
  if (normalized === 'src/services/ai/localAIAdapter.ts' && /createCatfishingPrototypeCandidates|scriptId\s*!==\s*['"]catfishing['"]|scriptId\s*===\s*['"]catfishing['"]/.test(text)) {
    failures.push(`AI setup candidates must use the generic SmartScriptPack pipeline: ${normalized}`)
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Architecture verification passed: entry/component budgets and anti-engine boundaries are clean.')
