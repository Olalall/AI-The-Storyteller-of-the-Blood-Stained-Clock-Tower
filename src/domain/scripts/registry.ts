import type { PlayerCount, ScriptId, SmartScriptPack } from './types'

export interface ScriptRegistry {
  all(): readonly SmartScriptPack[]
  get(scriptId: ScriptId): SmartScriptPack | null
  register(pack: SmartScriptPack): ScriptRegistry
  playableFor(playerCount: PlayerCount): readonly SmartScriptPack[]
}

export function createScriptRegistry(initialPacks: readonly SmartScriptPack[] = []): ScriptRegistry {
  const packsById = new Map<ScriptId, SmartScriptPack>()

  const registry: ScriptRegistry = {
    all: () => Array.from(packsById.values()),
    get: (scriptId) => packsById.get(scriptId) ?? null,
    register: (pack) => {
      assertUniqueScriptId(packsById, pack.scriptId)
      packsById.set(pack.scriptId, pack)
      return registry
    },
    playableFor: (playerCount) => registry.all().filter((pack) => pack.playerCounts.includes(playerCount)),
  }

  for (const pack of initialPacks) registry.register(pack)

  return registry
}

function assertUniqueScriptId(packsById: ReadonlyMap<ScriptId, SmartScriptPack>, scriptId: ScriptId) {
  if (packsById.has(scriptId)) {
    throw new Error(`重复的智能板子ID：${scriptId}`)
  }
}
