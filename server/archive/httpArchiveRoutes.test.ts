import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'
import { createGameArchiveRecord } from '../../src/services/archive/archiveService'
import type { AIReviewDraft, ReviewDraftProvider } from './types'
import { createArchiveHandlers } from './handlers'
import { createArchiveHttpRoutes } from './httpArchiveRoutes'
import { JsonArchiveRepository } from './jsonArchiveRepository'

let tempDir = ''
let handleRequest: (request: Request) => Promise<Response>

function fixture(commandId = 'save-route') {
  const session = createPrototypeGameSession()
  return {
    commandId,
    session,
    archive: createGameArchiveRecord({
      session,
      winner: 'good',
      archiveId: `local-${commandId}`,
      archivedAt: '2026-07-17T12:00:00.000Z',
    }),
  }
}

function request(pathname: string, init: RequestInit = {}) {
  return new Request(`http://127.0.0.1${pathname}`, init)
}

async function jsonBody(response: Response) {
  return response.json() as Promise<Record<string, unknown>>
}

describe('archive HTTP routes', () => {
  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'botc-archive-routes-'))
    const repository = new JsonArchiveRepository(path.join(tempDir, 'archives.json'))
    handleRequest = createArchiveHttpRoutes(createArchiveHandlers(repository))
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('saves an archive and returns it from list and detail routes', async () => {
    const data = fixture('route-save')
    const saved = await handleRequest(request(`/api/games/${data.session.id}/archive`, {
      method: 'POST',
      body: JSON.stringify({ commandId: data.commandId, payload: { archive: data.archive } }),
    }))

    expect(saved.status).toBe(200)
    const savedBody = await jsonBody(saved)
    expect(savedBody.accepted).toBe(true)
    const savedArchive = (savedBody.data as { archive: { id: string } }).archive

    const listBody = await jsonBody(await handleRequest(request('/api/archives')))
    expect((listBody.archives as unknown[])).toHaveLength(1)

    const detailBody = await jsonBody(await handleRequest(request(`/api/archives/${savedArchive.id}`)))
    expect((detailBody.archive as { id: string }).id).toBe(savedArchive.id)
  })

  it('returns reset gatekeeper error codes', async () => {
    const data = fixture('route-reset')
    const savedBody = await jsonBody(await handleRequest(request(`/api/games/${data.session.id}/archive`, {
      method: 'POST',
      body: JSON.stringify({ commandId: data.commandId, payload: { archive: data.archive } }),
    })))
    const archiveId = ((savedBody.data as { archive: { id: string } }).archive.id)

    const notConfirmed = await jsonBody(await handleRequest(request(`/api/games/${data.session.id}/reset-after-archive`, {
      method: 'POST',
      body: JSON.stringify({ commandId: 'reset-1', payload: { archiveId, confirmReset: false } }),
    })))
    expect((notConfirmed.error as { code: string }).code).toBe('RESET_NOT_CONFIRMED')

    const missing = await handleRequest(request(`/api/games/${data.session.id}/reset-after-archive`, {
      method: 'POST',
      body: JSON.stringify({ commandId: 'reset-2', payload: { archiveId: 'missing', confirmReset: true } }),
    }))
    expect(missing.status).toBe(404)
    expect(((await jsonBody(missing)).error as { code: string }).code).toBe('ARCHIVE_NOT_FOUND')

    const mismatch = await jsonBody(await handleRequest(request('/api/games/another-session/reset-after-archive', {
      method: 'POST',
      body: JSON.stringify({ commandId: 'reset-3', payload: { archiveId, confirmReset: true } }),
    })))
    expect((mismatch.error as { code: string }).code).toBe('SESSION_MISMATCH')
  })

  it('returns BAD_REQUEST for malformed archive commands', async () => {
    const data = fixture('route-bad-request')
    const response = await handleRequest(request(`/api/games/${data.session.id}/archive`, {
      method: 'POST',
      body: '{bad-json',
    }))

    expect(response.status).toBe(400)
    expect(((await jsonBody(response)).error as { code: string }).code).toBe('BAD_REQUEST')
  })

  it('returns ARCHIVE_NOT_FOUND for missing detail route', async () => {
    const response = await handleRequest(request('/api/archives/missing'))

    expect(response.status).toBe(404)
    expect(((await jsonBody(response)).error as { code: string }).code).toBe('ARCHIVE_NOT_FOUND')
  })

  it('generates a fake review draft without modifying the archive', async () => {
    const data = fixture('route-review-draft')
    const savedBody = await jsonBody(await handleRequest(request(`/api/games/${data.session.id}/archive`, {
      method: 'POST',
      body: JSON.stringify({ commandId: data.commandId, payload: { archive: data.archive } }),
    })))
    const savedArchive = (savedBody.data as { archive: { id: string } }).archive
    const before = await jsonBody(await handleRequest(request(`/api/archives/${savedArchive.id}`)))

    const response = await handleRequest(request(`/api/archives/${savedArchive.id}/review-draft`, {
      method: 'POST',
      body: JSON.stringify({ reviewStyle: 'sharp', includePlayerScores: true }),
    }))

    expect(response.status).toBe(200)
    const body = await jsonBody(response)
    expect(body.accepted).toBe(true)
    const draft = ((body.data as { draft: AIReviewDraft }).draft)
    expect(draft.archiveId).toBe(savedArchive.id)
    expect(draft.provider).toBe('fake')
    expect(draft.disclaimer).toContain('不是客观玩家能力评分')
    expect(draft.playerReviews).toHaveLength(data.session.playerCount)
    expect(draft.playerReviews[0].sharpComment).toBeTruthy()

    const after = await jsonBody(await handleRequest(request(`/api/archives/${savedArchive.id}`)))
    expect(after).toEqual(before)
  })

  it('can generate a provider-shaped review draft through an injected provider', async () => {
    const repository = new JsonArchiveRepository(path.join(tempDir, 'provider-archives.json'))
    const provider: ReviewDraftProvider = {
      async generateReviewDraft(archive) {
        return {
          draft: {
            archiveId: archive.id,
            generatedAt: '2026-07-19T00:00:00.000Z',
            provider: 'openai-compatible',
            confidence: 'medium',
            disclaimer: 'AI 复盘草稿，仅供说书人参考。',
            gameEvaluation: {
              summary: 'mock provider 当局评价。',
              highlights: ['记录结构完整'],
              risks: ['缺少语音语境'],
            },
            fullReview: {
              summary: 'mock provider 整局复盘。',
              turningPoints: ['第3天投票'],
              suggestedReplayOrder: ['配板', '夜晚行动', '投票'],
            },
            playerReviews: [],
          },
          warnings: ['provider_review_draft', 'draft_only'],
        }
      },
    }
    const route = createArchiveHttpRoutes(createArchiveHandlers(repository, { reviewDraftProvider: provider }))
    const data = fixture('route-provider-review')
    const savedBody = await jsonBody(await route(request(`/api/games/${data.session.id}/archive`, {
      method: 'POST',
      body: JSON.stringify({ commandId: data.commandId, payload: { archive: data.archive } }),
    })))
    const savedArchive = (savedBody.data as { archive: { id: string } }).archive

    const body = await jsonBody(await route(request(`/api/archives/${savedArchive.id}/review-draft`, { method: 'POST' })))
    const draft = ((body.data as { draft: AIReviewDraft }).draft)

    expect(body.accepted).toBe(true)
    expect(draft.provider).toBe('openai-compatible')
    expect(draft.disclaimer).toContain('草稿')
    expect((body.warnings as string[])).toContain('draft_only')
  })

  it('falls back to a fake review draft when the injected provider fails', async () => {
    const repository = new JsonArchiveRepository(path.join(tempDir, 'provider-fallback-archives.json'))
    const provider: ReviewDraftProvider = {
      async generateReviewDraft() {
        throw Object.assign(new Error('provider failed with private detail'), { code: 'AI_PROVIDER_TIMEOUT' })
      },
    }
    const route = createArchiveHttpRoutes(createArchiveHandlers(repository, { reviewDraftProvider: provider }))
    const data = fixture('route-provider-fallback')
    const savedBody = await jsonBody(await route(request(`/api/games/${data.session.id}/archive`, {
      method: 'POST',
      body: JSON.stringify({ commandId: data.commandId, payload: { archive: data.archive } }),
    })))
    const savedArchive = (savedBody.data as { archive: { id: string } }).archive

    const body = await jsonBody(await route(request(`/api/archives/${savedArchive.id}/review-draft`, { method: 'POST' })))
    const draft = ((body.data as { draft: AIReviewDraft }).draft)

    expect(body.accepted).toBe(true)
    expect(draft.provider).toBe('fake')
    expect((body.warnings as string[])).toContain('provider_failed:AI_PROVIDER_TIMEOUT')
    expect(JSON.stringify(body)).not.toContain('private detail')
  })

  it('returns ARCHIVE_NOT_FOUND for missing review draft archive', async () => {
    const response = await handleRequest(request('/api/archives/missing/review-draft', {
      method: 'POST',
      body: JSON.stringify({ reviewStyle: 'neutral', includePlayerScores: false }),
    }))

    expect(response.status).toBe(404)
    expect(((await jsonBody(response)).error as { code: string }).code).toBe('ARCHIVE_NOT_FOUND')
  })
})
