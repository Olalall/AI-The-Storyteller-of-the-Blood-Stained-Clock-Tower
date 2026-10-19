import { createScriptRegistry } from './registry'
import { normalizeImportedPack } from './normalizeImportedPack'
import type { SmartScriptPack } from './types'

/** Loaded knowledge cache only. It never contains or modifies game state. */
export function createPackLoader(ids: readonly string[], loaders: Record<string, () => Promise<SmartScriptPack>>, initial: readonly SmartScriptPack[]) {
  const packs: SmartScriptPack[] = []
  const registry = createScriptRegistry()
  const pending = new Map<string, Promise<SmartScriptPack>>()
  function register(pack: SmartScriptPack) {
    const normalized = normalizeImportedPack(pack)
    registry.register(normalized)
    packs.push(normalized)
    packs.sort((a, b) => ids.indexOf(a.scriptId) - ids.indexOf(b.scriptId))
    return normalized
  }
  initial.forEach(register)
  function load(id: string): Promise<SmartScriptPack> {
    const loaded = registry.get(id)
    if (loaded) return Promise.resolve(loaded)
    if (!ids.includes(id) || !Object.hasOwn(loaders, id)) return Promise.reject(new Error('当前版本不包含该剧本。'))
    const existing = pending.get(id)
    if (existing) return existing
    const request = Promise.resolve().then(() => loaders[id]()).then((pack) => {
      if (pack.scriptId !== id) throw new Error('剧本资料标识不匹配。')
      return register(pack)
    }).finally(() => { pending.delete(id) })
    pending.set(id, request)
    return request
  }
  function get(id: string) {
    const loaded = registry.get(id)
    if (loaded) return loaded
    if (!ids.includes(id)) return packs[0]
    throw new Error(`剧本资料尚未加载：${id}`)
  }
  return { packs, registry, load, get, loadAll: () => Promise.all(ids.map(load)) }
}
