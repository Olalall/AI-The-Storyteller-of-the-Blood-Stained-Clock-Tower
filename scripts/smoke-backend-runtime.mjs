import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { closeArchiveRuntime, startArchiveRuntime } from '../dist-server/runtime.mjs'

function smokeSession() {
  const createdAt = '2026-07-18T00:00:00.000Z'
  const role = { id: 'investigator', name: '调查员', initial: '调', iconPath: '/roles/investigator.png' }
  const draft = {
    candidateId: 'smoke-candidate',
    revision: 1,
    assignments: [{ seatId: 1, role }],
    demonBluffs: [],
    updatedAt: createdAt,
  }
  return {
    schemaVersion: 1,
    id: 'smoke-session',
    scriptId: 'catfishing',
    playerCount: 1,
    knowledgeVersion: 'smoke',
    scriptRoles: [role],
    seats: {
      1: { seatId: 1, label: '1号', nickname: '玩家1', experience: 'regular' },
    },
    initialPlayerStates: {
      1: { life: 'alive', poisoned: false, drunk: false, markers: [] },
    },
    phaseSegments: [],
    timeline: [{
      id: 'smoke-setup-entry',
      kind: 'setup_confirmed',
      segmentId: null,
      createdAt,
      confirmedBy: 'storyteller',
      setup: { id: 'smoke-setup', draft, confirmedAt: createdAt },
    }],
    dayVoteDraft: null,
    dayActionDraft: null,
    setupDraft: null,
    nightRuns: {},
    activeNightRunId: null,
  }
}

function smokeArchive() {
  const session = smokeSession()
  return {
    schemaVersion: 1,
    id: 'archive-smoke-session-smoke-command',
    sessionId: session.id,
    archivedAt: '2026-07-18T00:01:00.000Z',
    winner: 'good',
    winnerLabel: '善良获胜',
    scriptName: 'Smoke / Catfishing',
    playerCount: session.playerCount,
    summary: {
      alive: 1,
      dead: 0,
      phases: 1,
      records: 1,
      nightActions: 0,
      dayActions: 0,
      votes: 0,
      executions: 0,
      corrections: 0,
    },
    timeline: [{
      id: 'smoke-archive-item',
      kind: 'setup_confirmed',
      phaseLabel: '配板',
      summary: '1号配板已确认',
      createdAt: '2026-07-18T00:00:00.000Z',
    }],
    session,
  }
}

async function json(response) {
  const body = await response.json()
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${JSON.stringify(body)}`)
  return body
}

const tempDir = await mkdtemp(path.join(os.tmpdir(), 'botc-runtime-smoke-'))
const dataFile = path.join(tempDir, 'archives.json')
const server = startArchiveRuntime({ port: 0, dataFile })

try {
  await new Promise((resolve) => server.once('listening', resolve))
  const address = server.address()
  if (!address || typeof address !== 'object') throw new Error('Runtime did not expose a TCP address')
  const baseUrl = `http://127.0.0.1:${address.port}`
  const archive = smokeArchive()

  const health = await json(await fetch(`${baseUrl}/healthz`))
  if (health.ok !== true) throw new Error('healthz failed')

  const aiSettings = await json(await fetch(`${baseUrl}/api/settings/ai`))
  if (aiSettings.settings.mode !== 'off') throw new Error('AI settings should default to off')
  if (aiSettings.settings.apiKeyConfigured !== false) throw new Error('AI settings should not have a default key')

  const aiTest = await json(await fetch(`${baseUrl}/api/settings/ai/test`, { method: 'POST' }))
  if (aiTest.code !== 'AI_PROVIDER_DISABLED') throw new Error('AI settings test should default to disabled')

  const cors = await fetch(`${baseUrl}/api/settings/ai/live-test`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://127.0.0.1:4173',
      'Access-Control-Request-Method': 'POST',
    },
  })
  if (cors.status !== 204) throw new Error('CORS preflight did not return 204')
  if (cors.headers.get('access-control-allow-origin') !== 'http://127.0.0.1:4173') {
    throw new Error('CORS preflight did not allow local dev origin')
  }

  const liveTest = await json(await fetch(`${baseUrl}/api/settings/ai/live-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'openai-compatible', model: 'review-model' }),
  }))
  if (liveTest.code !== 'AI_PROVIDER_UNCONFIGURED') throw new Error('AI live test should require complete config')

  const saved = await json(await fetch(`${baseUrl}/api/games/${archive.sessionId}/archive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commandId: 'smoke-command', payload: { archive } }),
  }))
  if (saved.accepted !== true) throw new Error('archive command was not accepted')

  const list = await json(await fetch(`${baseUrl}/api/archives`))
  if (!Array.isArray(list.archives) || list.archives.length !== 1) throw new Error('archive list did not contain one record')

  const archiveId = saved.data.archive.id
  const detail = await json(await fetch(`${baseUrl}/api/archives/${archiveId}`))
  if (detail.archive.id !== archiveId) throw new Error('archive detail mismatch')

  const review = await json(await fetch(`${baseUrl}/api/archives/${archiveId}/review-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewStyle: 'sharp', includePlayerScores: true }),
  }))
  if (review.data.draft.provider !== 'fake') throw new Error('review draft was not fake')

  console.log(JSON.stringify({
    ok: true,
    baseUrl,
    archiveId,
    archives: list.archives.length,
    aiMode: aiSettings.settings.mode,
    reviewProvider: review.data.draft.provider,
  }, null, 2))
} finally {
  await closeArchiveRuntime(server)
  await rm(tempDir, { recursive: true, force: true })
}
