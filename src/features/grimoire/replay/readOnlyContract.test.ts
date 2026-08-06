/**
 * G3 验收③后半句：「全部写入入口 disabled（readOnly prop 强制，不靠自觉）」。
 *
 * 这一份钉的是「不靠自觉」。分三层：
 *   1. 清单必须盖住写入层的**全部**成员（编译期 + 运行时两道）；
 *   2. 清单里标成 write 的成员，封口后一次 dispatch 都不许发生（逐个跑，不抽查）；
 *   3. 「组件自己判断这是不是归档」这条路在源码层面被堵死。
 *
 * 每一层都配了反证：把封口拆掉、把判断搬回组件，对应的断言必须转红。
 */
import { act, renderHook } from '@testing-library/react'
import { useCallback, useState } from 'react'
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import { seatActionCells } from '../write/seatActions'
import { useGrimoireWriteLayer } from '../write/useGrimoireWriteLayer'
import { useSeatWriteBindings } from '../write/useSeatWriteBindings'
import { sealGrimoireWrite, SEAT_BINDINGS_SURFACE, WRITE_LAYER_SURFACE } from './sealWriteSurface'
import { ARCHIVE_READ_ONLY_REASON, LIVE_WRITE_ACCESS, resolveWriteAccess, type WriteAccess } from './writeAccess'
import type { GameSessionAction } from '../../game-session/state/sessionActions'
import type { GameSessionState } from '../../game-session/types'
import type { GrimoireWriteLayer } from '../write/useGrimoireWriteLayer'
import type { SeatWriteBindings } from '../write/useSeatWriteBindings'

const SEAT = 5

/** 从清单里挑出标成 write 的键。新加一个 write 成员，下面两张调用表就编译不过。 */
type WritingMembers<S> = { [K in keyof S]: S[K] extends 'write' ? K : never }[keyof S]

const READ_ONLY: WriteAccess = { readOnly: true, reason: ARCHIVE_READ_ONLY_REASON }

function harness(access: WriteAccess) {
  const dispatched: GameSessionAction[] = []
  const hook = renderHook(() => {
    const [session, setSession] = useState<GameSessionState>(createPrototypeGameSession)
    const dispatch = useCallback((action: GameSessionAction) => {
      dispatched.push(action)
      setSession((current) => gameSessionReducer(current, action))
    }, [])
    const layer = useGrimoireWriteLayer(session, dispatch)
    const bindings = useSeatWriteBindings(layer, 'night-3')
    // raw 是封口**之下**那台真机器。断言只看封口后的外观是不够的：
    // 「把结果藏起来」与「让调用根本到不了机器」在外观上一模一样，
    // 而前者一旦被别的入口绕过去（例如抽屉里的等价路径），就照样写得进去。
    return { ...sealGrimoireWrite({ layer, bindings }, access), raw: { layer, bindings }, session }
  })
  return { dispatched, hook }
}

const LAYER_WRITE_CALLS: Record<WritingMembers<typeof WRITE_LAYER_SURFACE>, (layer: GrimoireWriteLayer) => void> = {
  setDraft: (layer) => layer.setDraft({ seatId: SEAT, kind: 'life', source: 'storyteller' }),
  confirmDraft: (layer) => layer.confirmDraft(),
  commitBackfill: (layer) => layer.commitBackfill({
    seatId: SEAT,
    draft: { seatId: SEAT, kind: 'poisoned', source: 'storyteller' },
    backfill: { attributedPhaseSegmentId: 'night-3' },
    reason: '回看时试图补录',
  }),
  undo: (layer) => layer.undo(),
}

const BINDING_WRITE_CALLS: Record<WritingMembers<typeof SEAT_BINDINGS_SURFACE>, (bindings: SeatWriteBindings) => void> = {
  openActionBar: (bindings) => bindings.openActionBar(SEAT),
  draftFromCell: (bindings) => bindings.draftFromCell(SEAT, seatActionCells({ life: 'alive', poisoned: false, drunk: false, markers: [] })[0]),
  addMarker: (bindings) => bindings.addMarker(SEAT, '僧侣保护'),
  removeMarker: (bindings) => bindings.removeMarker(SEAT, 'marker-1'),
  // 长按一枚已落盘标记 = 装填一份删除草稿。挑这一路而不是「点击草稿即落账」，
  // 是因为后者在没有草稿时本来就什么都不做，测出来的绿分不清是封住了还是本来就没事发生。
  handleChipGesture: (bindings) => bindings.handleChipGesture(SEAT, {
    chip: { key: 'marker-1', kind: 'marker', label: '僧侣保护', markerId: 'marker-1' },
    hold: 'arm-delete',
  }),
}

describe('只读契约第一层：清单盖住写入面的全部成员', () => {
  it('lists exactly the members the live write layer hands out', () => {
    // 编译期由 satisfies 钉住键集；这一条钉的是运行时——hook 真正返回的对象
    // 多出一个成员时（例如加了字段却忘了写进 interface），封口会原样漏过它。
    const { hook } = harness(LIVE_WRITE_ACCESS)

    expect(Object.keys(hook.result.current.layer).sort()).toEqual(Object.keys(WRITE_LAYER_SURFACE).sort())
    expect(Object.keys(hook.result.current.bindings).sort()).toEqual(Object.keys(SEAT_BINDINGS_SURFACE).sort())
  })
})

describe('只读契约第二层：标成 write 的成员，封口后一次都写不出去', () => {
  it.each(Object.keys(LAYER_WRITE_CALLS) as (keyof typeof LAYER_WRITE_CALLS)[])(
    'refuses %s and says why instead of doing nothing',
    (member) => {
      const { dispatched, hook } = harness(READ_ONLY)
      const before = hook.result.current.session

      act(() => LAYER_WRITE_CALLS[member](hook.result.current.layer))

      expect(dispatched, `${member} 在回看态下不该产生任何 action`).toHaveLength(0)
      expect(hook.result.current.session, 'session 引用都不该动').toBe(before)
      expect(hook.result.current.raw.layer.draft, '连封口之下那台机器都不该被拨动').toBeNull()
      // 按下去什么都不发生是最坏的反馈：说书人会以为自己点上了。
      expect(hook.result.current.layer.receipt?.message).toBe(ARCHIVE_READ_ONLY_REASON)
      expect(hook.result.current.layer.receipt?.undoEntryId, '拒绝不是一次写入，没有可撤销的东西').toBeNull()
    },
  )

  it.each(Object.keys(BINDING_WRITE_CALLS) as (keyof typeof BINDING_WRITE_CALLS)[])(
    'refuses the seat gesture %s',
    (member) => {
      const { dispatched, hook } = harness(READ_ONLY)

      act(() => BINDING_WRITE_CALLS[member](hook.result.current.bindings))

      expect(dispatched).toHaveLength(0)
      // 浮层不许打开：一排看得见的写入键会让人反复去点。
      // 看 raw 而不是封口后的视图——后者的 actionBarSeatId 本来就被抹成 null，
      // 拿它断言等于问「你有没有把结果藏好」，而要问的是「调用有没有到机器上」。
      expect(hook.result.current.raw.bindings.actionBarSeatId).toBeNull()
      expect(hook.result.current.raw.layer.draft).toBeNull()
    },
  )

  it('blanks the draft and the ghosts a read-only board can never have', () => {
    const { hook } = harness(READ_ONLY)

    act(() => hook.result.current.layer.setDraft({ seatId: SEAT, kind: 'life', source: 'storyteller' }))

    expect(hook.result.current.layer.draft).toBeNull()
    expect(hook.result.current.layer.projected).toBeNull()
    expect(hook.result.current.layer.ghostsBySeat).toEqual({})
    expect(hook.result.current.layer.ghostLifeBySeat).toEqual({})
  })
})

describe('反证：同一串调用在进行中的对局里确实写得进去', () => {
  it('reaches the timeline through the very calls the seal blocks', () => {
    // 没有这一条，上面那组「0 次 dispatch」可能只是因为调用样本本来就写不出东西。
    const { dispatched, hook } = harness(LIVE_WRITE_ACCESS)

    act(() => LAYER_WRITE_CALLS.setDraft(hook.result.current.layer))
    expect(hook.result.current.layer.draft, '未封口时草稿必须真的立起来').not.toBeNull()

    act(() => LAYER_WRITE_CALLS.confirmDraft(hook.result.current.layer))
    act(() => LAYER_WRITE_CALLS.undo(hook.result.current.layer))
    act(() => LAYER_WRITE_CALLS.commitBackfill(hook.result.current.layer))

    expect(dispatched.length, '落账 + 撤销 + 补录 = 三条').toBe(3)
    expect(dispatched.every((action) => action.type === 'confirm-player-state-change')).toBe(true)
  })

  it('opens the action bar when the game is still running', () => {
    const { hook } = harness(LIVE_WRITE_ACCESS)

    act(() => BINDING_WRITE_CALLS.openActionBar(hook.result.current.bindings))

    expect(hook.result.current.bindings.actionBarSeatId).toBe(SEAT)
  })

  it('hands back the very same surface object when nothing is read-only', () => {
    // 进行中的对局必须零行为差异：封口函数在这条路上是恒等函数，不是「另一条分支」。
    const surface = { layer: {} as GrimoireWriteLayer, bindings: {} as SeatWriteBindings }
    expect(sealGrimoireWrite(surface, LIVE_WRITE_ACCESS)).toBe(surface)
  })
})

describe('只读判据只有一处，且不看模式脸色', () => {
  it('is read-only for every archive and writable only while the game runs', () => {
    const archive = {
      hostingMode: 'grimoire' as const,
      hostingModeHistory: [],
      grimoireCompleteness: { seatsWithRole: 12, totalSeats: 12, stateChangeCount: 9, markerCount: 3 },
    }

    expect(resolveWriteAccess({ archive: null, viewMode: 'grimoire' })).toEqual({ readOnly: false, reason: null })
    // 「这局本来就是魔典局，补一笔应该没关系」正是要堵死的那条缝。
    expect(resolveWriteAccess({ archive, viewMode: 'grimoire' }).readOnly).toBe(true)
    expect(resolveWriteAccess({ archive, viewMode: 'record' }).readOnly).toBe(true)
    expect(resolveWriteAccess({ archive, viewMode: 'grimoire' }).reason).toBe(ARCHIVE_READ_ONLY_REASON)
  })
})

// ---------------------------------------------------------------------------
// 第三层：源码扫描。组件自己判断「这是不是归档」这条路必须在仓库里不存在。
// ---------------------------------------------------------------------------

/**
 * 扫的不是「有没有人写了 readOnly」——魔典里本来就有两处正当的只读态
 * （夜间已关闭的段、白天已出结论的步骤），它们与归档毫无关系，禁掉它们纯属误伤。
 *
 * 扫的是**判断所需的原料在不在手边**：要判断「这是不是归档」，
 * 组件必须能摸到归档服务、摸到 archivedAt、或者自己调一次判据函数。
 * 这三样东西在画布这一侧一个都没有，组件就**没有能力**自己判断——
 * 这比逐个检查「你判对了没有」牢靠得多。
 */
const SELF_JUDGEMENT_PATTERNS = [
  { id: 'reads-archive', pattern: /from\s+['"][^'"]*services\/archive/ },
  { id: 'reads-archived-at', pattern: /\barchivedAt\b/ },
  { id: 'decides-here', pattern: /\bresolveWriteAccess\b/ },
  { id: 'builds-replay-context', pattern: /\bReplay(?:Context|Subject)\b/ },
  { id: 'derives-from-archive', pattern: /\b(?:readOnly|isReadOnly|canWrite)\s*=[^\n]*\b(?:archive|Archive|replay|Replay)\b/ },
] as const

/**
 * 注释先抹掉再扫。
 *
 * 本仓的注释里到处在解释「为什么这里不 dispatch」「归档为什么要读这个字段」，
 * 带着注释扫会把这些解释判成违规，而唯一能让 CI 变绿的改法是把解释删掉——
 * 那正好删掉了下一个人最需要读的东西。
 */
function stripComments(source: string): string {
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, ' ').replaceAll(/(^|[^:])\/\/.*$/gm, '$1')
}

export function selfJudgementHits(source: string): string[] {
  const code = stripComments(source)
  return SELF_JUDGEMENT_PATTERNS.filter(({ pattern }) => pattern.test(code)).map(({ id }) => id)
}

function grimoireSourceFiles(): string[] {
  const root = path.resolve(__dirname, '..')
  const walk = (directory: string): string[] => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) return entry.name === 'replay' ? [] : walk(target)
    return /\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name) ? [target] : []
  })
  return walk(root)
}

describe('只读契约第三层：组件自己判断这条路被堵死', () => {
  it('catches every shape of self-judgement it is meant to catch', () => {
    // 先证明扫描器不是个恒真的空壳——这一条一旦被删，下面那条就变成了永远绿的装饰。
    expect(selfJudgementHits("import { getArchive } from '../../../services/archive'")).toContain('reads-archive')
    expect(selfJudgementHits('if (record.archivedAt) return null')).toContain('reads-archived-at')
    expect(selfJudgementHits('const access = resolveWriteAccess(context)')).toContain('decides-here')
    expect(selfJudgementHits('function f(context: ReplayContext) {}')).toContain('builds-replay-context')
    expect(selfJudgementHits('const readOnly = archive !== null')).toContain('derives-from-archive')
  })

  it('leaves the two read-only states that have nothing to do with archives alone', () => {
    // 夜间「这一段已经关了」与白天「这一步已经出结论了」都是正当的本地只读态。
    // 把它们一起禁掉，下一个人就会为了让 CI 过而把判据改名，而不是把它移上去。
    expect(selfJudgementHits('const readOnly = isReadOnlyMode(deriveWorkbenchMode(run, current))')).toEqual([])
    expect(selfJudgementHits('const readOnly = focus.writeLocked || context.hasResolution || !active')).toEqual([])
    expect(selfJudgementHits('function Grid({ readOnly = false }: Props) {}'), '接收 prop 不算自己判断').toEqual([])
  })

  it('accounts for every dispatching surface in the canvas tree', () => {
    // 封口只盖得住它认识的那块写入面。画布树里若长出**第二个**会 dispatch 的地方，
    // 回看态下它照样写得进去，而这件事在界面上没有任何表现。
    // 所以这里逐个点名：要么已被封口盖住，要么写清楚为什么还没有——
    // 新增一个没交代的 dispatch 会让这条转红，而不是悄悄留一个洞。
    const accounted: Record<string, string> = {
      'write/useGrimoireWriteLayer.ts': 'sealed —— WRITE_LAYER_SURFACE 盖住它的全部成员',
      'GrimoireStage.tsx': '只是把 dispatch 透传给写入层与抽屉页，自己不构造 action',
      'day/useDayRing.ts': '白天票型草稿（set-day-vote-draft）。不在本批文件范围内，主控接线时必须一并封',
      'stage/HostingModeSection.tsx': '切换主持模式（set-hosting-mode）。回看归档时这个入口根本不该出现——改的是史实',
      'stage/SessionInfoOverlay.tsx': '把 dispatch 透传给 HostingModeSection，随它一起处理',
    }
    const dispatching = grimoireSourceFiles()
      .map((file) => ({
        file: path.relative(path.resolve(__dirname, '..'), file),
        code: stripComments(fs.readFileSync(file, 'utf8')),
      }))
      .filter(({ code }) => /\bdispatch\s*\(/.test(code) || /\bdispatch=\{/.test(code))
      .map(({ file }) => file.split(path.sep).join('/'))

    expect(dispatching.length, '至少写入层自己应当被扫到').toBeGreaterThan(0)
    expect(dispatching.filter((file) => !(file in accounted))).toEqual([])
  })

  it('finds no canvas-side file deciding read-only-ness for itself', () => {
    const files = grimoireSourceFiles()
    // 扫到 0 个文件也会让下面那条断言通过，所以先钉住扫描面确实存在。
    expect(files.length, '魔典目录下应当有一批被扫的源文件').toBeGreaterThan(20)

    const offenders = files
      .map((file) => ({ file: path.relative(process.cwd(), file), hits: selfJudgementHits(fs.readFileSync(file, 'utf8')) }))
      .filter((entry) => entry.hits.length > 0)

    // 决定权在 replay/ 与它上面的主控手里；画布这一侧只负责收下 readOnly 并照做。
    expect(offenders).toEqual([])
  })
})
