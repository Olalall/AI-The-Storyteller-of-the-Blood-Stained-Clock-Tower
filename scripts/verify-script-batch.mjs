import { createHash } from 'node:crypto'

/** Only this Node VM's registry receives a confirmed projection; persisted drafts remain unapproved. */
export function verifyPreparedScript(prepared, context) {
  const load = (file) => context.load(context.module(file))
  const { smartScriptRegistry } = load('src/domain/scripts/catalog.ts')
  const { createSmartScriptSetupCandidates, evaluateSmartScriptSetup } = load('src/features/setup/smartScriptSetupCandidates.ts')
  const { createSmartScriptSetupSession } = load('src/features/game-session/data/createPrototypeSession.ts')
  const { createSetupDraftFromCandidate } = load('src/features/setup/setupDraft.ts')
  const { gameSessionReducer } = load('src/features/game-session/state/sessionReducer.ts')
  const { createSmartScriptNightQueue } = load('src/features/game-session/state/createNextNightRun.ts')
  const { lilMonstaOpeningSelected } = load('src/domain/setup-templates/lilMonstaOpening.ts')
  const definition = prepared.definition
  const pack = context.normalizeImportedPack(context.createReferencedScriptPack({ ...definition,
    knowledgeStatus: 'confirmed', setupTemplates: definition.setupTemplates.map((template) => ({ ...template, verified: true })),
  }, context.library))
  smartScriptRegistry.register(pack)
  const groups = [], contracts = new Map(), coveredRoles = new Set(), nonSeatedRoles = new Set()
  let candidateCount = 0, nightQueueCount = 0
  for (const count of definition.playerCounts) {
    const at = '2026-10-21T00:00:00.000Z'
    const empty = createSmartScriptSetupSession(pack.scriptId, at, { playerCount: count })
    const candidates = createSmartScriptSetupCandidates(pack.scriptId, Object.values(empty.seats), { count: pack.setupTemplates.length, seed: `intake-${pack.scriptId}-${count}` })
    const expected = definition.setupTemplates.filter((entry) => entry.playerCount === count).length
    if (candidates.length !== expected) throw new Error(`生产配座未覆盖全部模板：${count}人 ${candidates.length}/${expected}`)
    for (const candidate of candidates) {
      const evaluated = evaluateSmartScriptSetup(pack.scriptId, candidate.assignments, candidate.demonBluffs,
        Object.keys(empty.seats).map(Number), candidate.setupRuleSelections, candidate.repeatableRoleIds)
      if (evaluated.checks.some((check) => !check.passed && check.status !== 'review')) throw new Error(`生产配板判定失败：${count}人`)
      const drafted = gameSessionReducer(empty, { type: 'set-setup-draft', draft: createSetupDraftFromCandidate(candidate, at) })
      const confirmed = gameSessionReducer(drafted, { type: 'confirm-setup', id: 'intake-confirmed', confirmedAt: at })
      if (!confirmed.timeline.some((entry) => entry.kind === 'setup_confirmed')) throw new Error(`生产确认配板失败：${count}人`)
      candidate.assignments.forEach((entry) => coveredRoles.add(entry.role.id))
      for (const sequence of [1, 2]) {
        const queue = createSmartScriptNightQueue(confirmed, candidate.assignments, confirmed.initialPlayerStates, `intake-night-${sequence}`, sequence)
        const orders = sequence === 1 ? pack.nightOrders.firstNight : pack.nightOrders.otherNight
        const expectedRoles = [...orders].sort((a, b) => a.order - b.order).flatMap((order) => {
          if (order.roleId === 'lilmonsta' && lilMonstaOpeningSelected(pack, candidate.setupRuleSelections ?? [])) return sequence === 1 ? ['lilmonsta'] : ['lilmonsta', 'lilmonsta']
          const actors = candidate.assignments.filter((entry) => entry.role.id === order.roleId)
          if (order.roleId === 'legion' && actors.length) return ['legion']
          return order.delivery?.kind === 'audience_notice' ? actors.length ? [order.roleId] : [] : actors.map(() => order.roleId)
        })
        const actualRoles = queue.filter((item) => !item.id.includes('-pretend-')).map((item) =>
          item.systemStep?.kind === 'audience_notice' ? item.roleId.replace(/^system-audience-/, '') : item.roleId)
        if (JSON.stringify(actualRoles) !== JSON.stringify(expectedRoles)) throw new Error('生产夜序与已声明夜表不一致：' + JSON.stringify({ actualRoles, expectedRoles }))
        for (const item of queue) {
          if (item.lilMonstaStep) nonSeatedRoles.add(item.roleId)
          const { id: _id, playerLabel: _label, seatId: _seat, orderIndex: _order, ...contract } = item
          const signature = createHash('sha256').update(JSON.stringify({ nightType: sequence === 1 ? 'first' : 'other', count, contract })).digest('hex')
          contracts.set(signature, { signature, roleId: item.roleId, nightType: sequence === 1 ? 'first' : 'other', playerCount: count,
            interactionVersion: item.interactionVersion, sourceDefinitionHash: definition.roleDefinitionHashes[item.roleId] ?? null })
        }
        nightQueueCount++
      }
      candidateCount++
    }
    groups.push({ playerCount: count, candidates: candidates.length, passed: true })
  }
  return { candidateCount, nightQueueCount, groups, wakeContracts: [...contracts.values()],
    rolesOutsideGeneratedTemplates: pack.roles.filter((role) => ['townsfolk', 'outsider', 'minion', 'demon'].includes(role.team)
      && !coveredRoles.has(role.id) && !nonSeatedRoles.has(role.id)).map((role) => role.id) }
}
