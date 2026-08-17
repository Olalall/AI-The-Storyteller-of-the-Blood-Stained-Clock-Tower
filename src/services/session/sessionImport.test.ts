import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'
import { initialNightWorkbenchState } from '../../features/night-workbench/data/initialNightWorkbenchState'
import { createDayActionDraft } from '../../features/game-session/state/dayActionDraft'
import {
  MAX_SESSION_IMPORT_BYTES,
  parseSessionImportText,
  readSessionImportFile,
} from './sessionImport'

describe('对局 JSON 安全导入解析', () => {
  beforeEach(() => window.localStorage.clear())

  it('parses a current export and returns a confirmation preview without writing storage', () => {
    const session = createPrototypeGameSession()
    const setItem = vi.spyOn(Storage.prototype, 'setItem')

    const result = parseSessionImportText(JSON.stringify(session))

    expect(result).toMatchObject({
      ok: true,
      preview: {
        sessionId: session.id,
        scriptId: session.scriptId,
        playerCount: session.playerCount,
        timelineCount: session.timeline.length,
        source: 'game-session',
      },
    })
    if (result.ok) {
      expect(result.session).toEqual(session)
      expect(result.preview.updatedAt).toBeDefined()
    }
    expect(setItem).not.toHaveBeenCalled()
  })

  it('reuses the existing v1 compatibility normalization', () => {
    const legacy = JSON.parse(JSON.stringify(createPrototypeGameSession())) as {
      dayVoteDraft?: unknown
      dayActionDraft?: unknown
      seats: Record<string, Record<string, unknown>>
      timeline: Array<Record<string, unknown>>
    }
    delete legacy.dayVoteDraft
    delete legacy.dayActionDraft
    legacy.seats['3'] = { ...legacy.seats['3'], name: '3号阿杰' }
    delete legacy.seats['3'].nickname
    const setup = legacy.timeline.find((entry) => entry.kind === 'setup_confirmed')!
    const role = (setup.setup as { id: string; draft: { assignments: Array<{ seatId: number; role: unknown }> } }).draft.assignments[0].role
    legacy.timeline.push({
      id: 'old-role-change',
      kind: 'setup_changed',
      segmentId: null,
      createdAt: '2026-07-13T01:00:00.000Z',
      confirmedBy: 'storyteller',
      baseSetupId: (setup.setup as { id: string }).id,
      seatId: 1,
      fromRole: role,
      toRole: role,
      reason: '旧版记录',
      effectiveFrom: 'future_workbenches',
    })

    const result = parseSessionImportText(JSON.stringify(legacy))

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.session.dayVoteDraft).toBeNull()
    expect(result.session.dayActionDraft).toBeNull()
    expect(result.session.seats[3].nickname).toBe('阿杰')
    expect(result.session.seats[3]).not.toHaveProperty('name')
    expect(result.session.timeline.at(-1)).toMatchObject({ originNightRunId: null })
  })

  it('migrates the already-supported legacy night workbench into a preview candidate', () => {
    const result = parseSessionImportText(JSON.stringify(initialNightWorkbenchState))

    expect(result).toMatchObject({
      ok: true,
      preview: {
        source: 'legacy-night-workbench',
        sessionId: 'prototype-catfishing-12',
      },
    })
  })

  it.each([
    ['损坏 JSON', '{"id":"half-written"', 'invalid-json'],
    ['缺少必需字段', JSON.stringify({ schemaVersion: 1, id: 'missing-fields' }), 'invalid-session'],
    ['数组顶层', JSON.stringify([]), 'invalid-root'],
    ['空值顶层', 'null', 'invalid-root'],
  ])('rejects %s with a specific error', (_label, raw, code) => {
    expect(parseSessionImportText(raw)).toMatchObject({ ok: false, code })
  })

  it.each([
    ['空的玩家状态', (session: ReturnType<typeof createPrototypeGameSession>) => { session.initialPlayerStates[1] = null as never }],
    ['异常玩家人数', (session: ReturnType<typeof createPrototypeGameSession>) => { session.playerCount = 999 }],
    ['损坏的座位', (session: ReturnType<typeof createPrototypeGameSession>) => { session.seats[1] = { seatId: 1 } as never }],
    ['损坏的状态变更', (session: ReturnType<typeof createPrototypeGameSession>) => {
      session.timeline.push({
        id: 'broken-state', kind: 'player_state_changed', segmentId: null,
        createdAt: '2026-08-17T00:00:00.000Z', confirmedBy: 'storyteller', seatId: 1,
        before: { life: 'alive', poisoned: false, drunk: false, markers: [] },
        after: { life: 'alive', poisoned: false, drunk: false } as never,
        reason: 'broken',
      })
    }],
  ])('rejects a structurally unsafe session: %s', (_label, mutate) => {
    const session = createPrototypeGameSession()
    mutate(session)
    expect(parseSessionImportText(JSON.stringify(session))).toMatchObject({ ok: false, code: 'invalid-session' })
  })

  it.each([
    ['空夜序', (run: Record<string, unknown>) => { run.queue = [] }],
    ['缺少夜序显示字段', (run: Record<string, unknown>) => {
      const queue = run.queue as Array<Record<string, unknown>>
      delete queue[0].roleInitial
    }],
    ['损坏的 AI 建议日志', (run: Record<string, unknown>) => { run.aiAdviceLog = { broken: {} } }],
    ['指向不存在角色的更正项', (run: Record<string, unknown>) => { run.correctionItemId = 'missing-item' }],
  ])('rejects a night run that would crash or corrupt the workbench: %s', (_label, mutate) => {
    const session = createPrototypeGameSession()
    const run = Object.values(session.nightRuns)[0] as unknown as Record<string, unknown>
    mutate(run)

    expect(parseSessionImportText(JSON.stringify(session))).toMatchObject({ ok: false, code: 'invalid-session' })
  })

  it('fills safe defaults for legacy night-run UI fields', () => {
    const session = createPrototypeGameSession()
    const run = Object.values(session.nightRuns)[0] as unknown as Record<string, unknown>
    delete run.revision
    delete run.knowledgeVersion
    delete run.aiAdviceLog
    delete run.correctionItemId
    delete run.lastNotice

    const result = parseSessionImportText(JSON.stringify(session))

    expect(result.ok).toBe(true)
    if (!result.ok) return
    const normalizedRun = Object.values(result.session.nightRuns)[0]
    expect(normalizedRun).toMatchObject({
      revision: 0,
      knowledgeVersion: session.knowledgeVersion,
      aiAdviceLog: {},
      correctionItemId: null,
      lastNotice: '',
    })
  })

  it('normalizes missing legacy day-action maps but rejects malformed maps', () => {
    const legacy = createPrototypeGameSession()
    legacy.dayActionDraft = createDayActionDraft()
    delete (legacy.dayActionDraft.skill as Partial<typeof legacy.dayActionDraft.skill>).targetActualRoleIds
    delete legacy.dayActionDraft.skill.targetAlignments

    const compatible = parseSessionImportText(JSON.stringify(legacy))
    expect(compatible.ok).toBe(true)
    if (compatible.ok) {
      expect(compatible.session.dayActionDraft?.skill.targetActualRoleIds).toEqual({})
      expect(compatible.session.dayActionDraft?.skill.targetAlignments).toEqual({})
    }

    const malformed = createPrototypeGameSession()
    malformed.dayActionDraft = createDayActionDraft()
    malformed.dayActionDraft.skill.targetActualRoleIds = { 1: 42 as never }
    expect(parseSessionImportText(JSON.stringify(malformed))).toMatchObject({ ok: false, code: 'invalid-session' })
  })

  it('rejects an oversized string before JSON parsing', () => {
    const raw = ' '.repeat(MAX_SESSION_IMPORT_BYTES + 1)
    expect(parseSessionImportText(raw)).toMatchObject({ ok: false, code: 'too-large' })
  })

  it('reads a File through the thin adapter and preserves the same result contract', async () => {
    const raw = JSON.stringify(createPrototypeGameSession())
    const file = { size: new TextEncoder().encode(raw).byteLength, text: async () => raw } as File

    const result = await readSessionImportFile(file)

    expect(result).toMatchObject({ ok: true, preview: { source: 'game-session' } })
  })

  it('does not read a File whose declared size is already over the limit', async () => {
    const text = vi.fn(async () => '{}')
    const file = { size: MAX_SESSION_IMPORT_BYTES + 1, text } as unknown as File

    const result = await readSessionImportFile(file)

    expect(result).toMatchObject({ ok: false, code: 'too-large' })
    expect(text).not.toHaveBeenCalled()
  })

  it('returns a clear error when the browser cannot read the selected File', async () => {
    const file = {
      size: 128,
      text: async () => { throw new DOMException('read failed', 'NotReadableError') },
    } as unknown as File

    await expect(readSessionImportFile(file)).resolves.toMatchObject({
      ok: false,
      code: 'file-read-failed',
    })
  })
})
