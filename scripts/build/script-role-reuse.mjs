import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { roleDefinitionHashes } from './role-definition-pins.mjs'
import { splitScriptSource } from '../scout-clocktower-wiki.mjs'
import { intakeRoleId } from './intake-role-id.mjs'

export const sha256 = (value) => createHash('sha256').update(value).digest('hex')
// Only role identity/text is reused; author reminders, night order and special rules remain board review.
export const roleReviewKey = (raw, canonicalId) => {
  const role = typeof raw === 'string' ? { id: raw } : raw
  return sha256(JSON.stringify({ id: canonicalId ?? role.id, name: role.name ?? null,
    team: role.team === 'traveller' ? 'traveler' : role.team ?? null, ability: role.ability ?? null, setup: role.setup ?? null }))
}

/** Reuse reviewed source mappings only while both original bytes and full shared definitions still match. */
export function createRoleReuseIndex(root, context) {
  const canonical = id => intakeRoleId(id, context.normalizeRoleId)
  const reviewed = new Map(), currentDefinitions = new Map(), invalidProofs = [], fingerprints = new Map()
  let verifiedSources = 0, staleRoleMappings = 0
  const reference = (resolved) => ({ id: context.normalizeRoleId(resolved.role.id), sourceId: resolved.sourceId, sourceVersion: resolved.sourceVersion })
  const fingerprint = (resolved) => {
    const role = { ...resolved.role, id: context.normalizeRoleId(resolved.role.id) }
    const key = JSON.stringify(reference(resolved))
    if (!fingerprints.has(key)) fingerprints.set(key, roleDefinitionHashes([role])[role.id])
    return fingerprints.get(key)
  }
  const directory = resolve(root, 'src/domain/scripts/packs')
  const library = { ...context.library, resolve(ref) {
    try { return context.library.resolve(ref) } catch (error) {
      const candidates = typeof ref === 'string' ? [...(currentDefinitions.get(canonical(ref))?.values() ?? [])] : []
      if (candidates.length === 1) return candidates[0]
      throw error
    }
  } }
  for (const item of readdirSync(directory, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
    const lockPath = resolve(directory, item.name, 'source-lock.json'), sourcePath = resolve(directory, item.name, 'source.json')
    if (!existsSync(lockPath) || !existsSync(sourcePath)) continue
    const lock = JSON.parse(readFileSync(lockPath, 'utf8'))
    if (lock.knowledgeStatus !== 'confirmed' || !Array.isArray(lock.roleAliases)) continue
    const bytes = readFileSync(sourcePath)
    if (sha256(bytes) !== lock.rawJsonSha256 || bytes.length !== lock.rawJsonByteLength) { invalidProofs.push(item.name); continue }
    const entries = splitScriptSource(JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''))).roles
    if (entries.length !== lock.roleAliases.length) { invalidProofs.push(item.name); continue }
    verifiedSources++
    const pack = context.packs.find((entry) => entry.scriptId === item.name), ids = new Set(pack?.roles.map((role) => role.id))
    const currentNight = pack?.knowledgeStatus === 'confirmed' && pack.roles.every((role) => context.officialIds.has(role.id))
      && ['firstNight', 'otherNight'].every((phase) => JSON.stringify(pack.nightOrders[phase].map((entry) => entry.roleId))
        === JSON.stringify(context.nightSheet[phase].filter((id) => ids.has(id))))
    entries.forEach((raw, index) => {
      const alias = lock.roleAliases[index], original = typeof raw === 'string' ? { id: raw } : raw
      if (!alias.aliasReviewed || !alias.abilityTextReviewed || original?.id !== alias.rawId
        || (typeof original.ability === 'string' ? sha256(original.ability) : null) !== alias.rawAbilitySha256) return
      try {
        const resolved = context.library.resolve({ id: alias.roleId, sourceId: alias.sourceId, sourceVersion: alias.sourceVersion })
        const hash = fingerprint(resolved), team = original.team === 'traveller' ? 'traveler' : original.team
        if (hash !== alias.sharedRoleDefinitionHash) { staleRoleMappings++; return }
        if (resolved.role.knowledgeStatus !== 'confirmed' || team && team !== resolved.role.team) return
        const canonicalId = canonical(resolved.role.id), declaredId = canonical(original.id)
        if (context.normalizeRoleId(resolved.role.id) !== canonicalId) return
        if (context.library.variants(declaredId).length && declaredId !== canonicalId) return
        if (currentNight) {
          const choices = currentDefinitions.get(canonicalId) ?? new Map()
          choices.set(hash, resolved); currentDefinitions.set(canonicalId, choices)
        }
        for (const key of new Set([roleReviewKey(raw), roleReviewKey(raw, canonicalId), roleReviewKey(raw, '@source-text')])) {
          const variants = reviewed.get(key) ?? new Map()
          variants.set(hash, { ...resolved, proofScriptId: item.name, definitionHash: hash }); reviewed.set(key, variants)
        }
      } catch { staleRoleMappings++ }
    })
  }
  return {
    verifiedSources, invalidProofs, staleRoleMappings, library,
    resolve(raw) {
      const original = typeof raw === 'string' ? { id: raw } : raw
      if (!original || typeof original.id !== 'string' || !original.id.trim()) return { status: 'invalid-role', reusable: false }
      const declaredId = canonical(original.id), declaredKnown = context.library.variants(declaredId).length > 0
      const legacyAlias = context.normalizeRoleId(original.id) !== declaredId
      const hint = typeof original.GstoneID === 'string' ? canonical(original.GstoneID) : ''
      if (declaredKnown && hint && hint !== declaredId) return { status: 'conflicting-source-identity', reusable: false, roleId: declaredId }
      const suffixId = canonical(original.id.replace(/_?button$/, ''))
      let id = declaredKnown ? declaredId : hint && context.library.variants(hint).length ? hint
        : context.library.variants(suffixId).length ? suffixId : declaredId
      const textIdentity = !declaredKnown && typeof original.name === 'string' && typeof original.ability === 'string' && typeof original.team === 'string'
      const candidates = [...(reviewed.get(roleReviewKey(raw))?.values() ?? []), ...(reviewed.get(roleReviewKey(raw, id))?.values() ?? []),
        ...(textIdentity ? reviewed.get(roleReviewKey(raw, '@source-text'))?.values() ?? [] : [])]
      const previous = [...new Map(candidates.map((entry) => [entry.definitionHash, entry])).values()]
      if (previous.length === 1 && hint && context.library.variants(hint).length && canonical(previous[0].role.id) !== hint) {
        return { status: 'conflicting-source-identity', reusable: false }
      }
      if (previous.length === 1) return { status: 'reviewed-source', reusable: true, reference: reference(previous[0]), definitionHash: previous[0].definitionHash, proofScriptId: previous[0].proofScriptId }
      if (previous.length > 1) return { status: 'conflicting-reviewed-versions', reusable: false }
      let variants = context.library.variants(id)
      if (!variants.length && textIdentity) {
        variants = context.library.all().filter(({ role }) => role.name === original.name
          && role.abilityText === original.ability && role.team === (original.team === 'traveller' ? 'traveler' : original.team))
        const ids = [...new Set(variants.map(({ role }) => canonical(role.id)))]
        if (ids.length === 1) id = ids[0]
        if (ids.length === 1) variants = variants.filter(entry => context.normalizeRoleId(entry.role.id) === id)
      }
      if (!variants.length && textIdentity) {
        const named = context.library.all().filter(({ role }) => role.name === original.name
          && role.team === (original.team === 'traveller' ? 'traveler' : original.team))
        const ids = [...new Set(named.map(({ role }) => canonical(role.id)))]
        if (ids.length === 1) {
          try {
            const proposed = library.resolve(ids[0])
            if (proposed.role.knowledgeStatus === 'confirmed') return { status: 'unreviewed-alias-candidate', reusable: false,
              roleId: ids[0], reference: reference(proposed), definitionHash: fingerprint(proposed), identityReviewRequired: true, sourceTextReviewRequired: true }
          } catch { /* Matching a name cannot choose between rule versions. */ }
        }
        return { status: named.length ? 'ambiguous-alias-candidate' : 'unknown-role-or-alias', reusable: false,
          candidates: named.map((entry) => ({ ...reference(entry), definitionHash: fingerprint(entry) })) }
      }
      if (!variants.length) return { status: 'unknown-role-or-alias', reusable: false }
      if (declaredKnown && !legacyAlias && (typeof raw === 'string' || Object.keys(original).every((field) => field === 'id'))) {
        try {
          const resolved = library.resolve(id)
          if (resolved.role.knowledgeStatus === 'confirmed') return { status: 'current-id-default', reusable: true, reference: reference(resolved), definitionHash: fingerprint(resolved) }
        } catch { /* Ambiguous definitions need an explicit reviewed source. */ }
      }
      const team = original.team === 'traveller' ? 'traveler' : original.team
      const matches = variants.filter(({ role }) => role.knowledgeStatus === 'confirmed' && (!team || role.team === team)
        && original.ability === role.abilityText && (declaredKnown || original.name === role.name))
      let exact
      try { const preferred = library.resolve(id); exact = matches.find((entry) => fingerprint(entry) === fingerprint(preferred)) } catch { /* Multiple versions need one exact definition. */ }
      if (!exact && new Set(matches.map(fingerprint)).size === 1) exact = matches[0]
      if (exact) return { status: 'existing-definition-text', reusable: true, reference: reference(exact), definitionHash: fingerprint(exact) }
      let draft
      try { const preferred = library.resolve(id); if (preferred.role.knowledgeStatus === 'confirmed') draft = preferred } catch { /* A version choice cannot be guessed. */ }
      return { status: matches.length ? 'ambiguous-source-version' : 'role-version-review', reusable: false, roleId: declaredKnown || context.library.variants(id).length ? id : undefined,
        ...(draft ? { reference: reference(draft), definitionHash: fingerprint(draft), sourceTextReviewRequired: true } : {}),
        candidates: matches.map((resolved) => ({ ...reference(resolved), definitionHash: fingerprint(resolved) })) }
    },
  }
}
