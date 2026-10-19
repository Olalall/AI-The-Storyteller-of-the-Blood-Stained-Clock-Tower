import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useMemo } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createSmartScriptSetupSession, gameSessionStorageKey } from '../game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../game-session/state/sessionReducer'
import { useGameSession } from '../game-session/state/useGameSession'
import { createSmartScriptSetupCandidates } from '../setup/smartScriptSetupCandidates'
import type { GameSessionState } from '../game-session/types'
import type { SetupSeatProfile } from '../setup/types'
import { NightWorkbench } from './NightWorkbench'

function makeProfiles(playerCount: number): SetupSeatProfile[] {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' : index % 3 === 0 ? 'veteran' : 'regular',
  }))
}

/** 一局已确认配板、并已开出第一夜的对局。 */
function seedFirstNightSession(): GameSessionState {
  const profiles = makeProfiles(12)
  const base = createSmartScriptSetupSession('trouble-brewing', '2026-08-04T00:00:00.000Z', {
    playerCount: 12,
    seats: profiles,
  })
  const candidate = createSmartScriptSetupCandidates('trouble-brewing', profiles, { seed: 'tb-card' })[0]
  const confirmed: GameSessionState = {
    ...base,
    timeline: [{
      id: 'setup-entry',
      kind: 'setup_confirmed',
      segmentId: null,
      createdAt: '2026-08-04T00:01:00.000Z',
      confirmedBy: 'storyteller',
      setup: {
        id: 'setup-1',
        confirmedAt: '2026-08-04T00:01:00.000Z',
        draft: {
          candidateId: candidate.id,
          revision: 1,
          assignments: candidate.assignments,
          demonBluffs: candidate.demonBluffs,
          setupRuleSelections: candidate.setupRuleSelections,
          setupRulePackVersion: candidate.setupRulePackVersion,
          updatedAt: '2026-08-04T00:01:00.000Z',
        },
      },
    }],
  }
  const started = gameSessionReducer(confirmed, { type: 'start-next-night-run' })
  return gameSessionReducer(started, { type: 'open-phase-segment', phaseKind: 'night', createdAt: '2026-08-04T00:02:00.000Z' })
}

describe('首夜系统步骤卡的界面', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(seedFirstNightSession()))
  })

  function Harness() {
    const { session, dispatch } = useGameSession()
    const sessionBinding = useMemo(() => ({ session, dispatchSession: dispatch }), [session, dispatch])
    return <NightWorkbench sessionBinding={sessionBinding} onExit={() => undefined} />
  }

  it('opens on 爪牙信息 with a read-only roster and no target grid', () => {
    render(<Harness />)

    expect(screen.getByText('步骤说明 · 爪牙信息')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '本步骤名单' })).toBeInTheDocument()
    expect(screen.getByText(/出示信息标记：「他是恶魔」/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /选择1号玩家/ })).not.toBeInTheDocument()
    // 系统步骤没有可换的角色。
    expect(screen.queryByRole('button', { name: '更换角色' })).not.toBeInTheDocument()
  })

  it('conceals sensitive system names in the card, readiness hint and validation notice', async () => {
    const session = seedFirstNightSession()
    const run = session.nightRuns[session.activeNightRunId!]
    const item = run.queue[0]
    run.queue = [{ ...item, roleName: '落难少女信息', playerLabel: '3号 私密玩家', systemStep: {
      ...item.systemStep!, kind: 'audience_notice', sensitive: true,
      recipientLabels: ['3号 私密玩家'], minionLabels: ['3号 私密玩家'], infoTokens: ['落难少女'],
      checks: [{ id: 'private-check', label: '已向3号 私密玩家展示落难少女标记' }],
    } }]
    run.privacyShielded = true
    run.lastNotice = '请先向3号 私密玩家展示落难少女标记。'
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(session))
    const { container } = render(<Harness />)

    expect(screen.getByText('已遮蔽')).toBeVisible()
    expect(container.innerHTML).not.toMatch(/落难少女|私密玩家/)
    expect(screen.getByRole('button', { name: '确认本项' })).toBeDisabled()
    await userEvent.setup().click(screen.getByRole('button', { name: '解除遮蔽' }))
    expect(screen.getByRole('checkbox', { name: /已向3号 私密玩家展示落难少女标记/ })).toBeVisible()
    expect(JSON.parse(window.localStorage.getItem(gameSessionStorageKey)!).timeline).toEqual(session.timeline)
  })

  it('needs the checklist before the shared action bar will confirm', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    expect(screen.getByText(/还差：勾选「已逐个指认恶魔/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '确认本项' })).toBeDisabled()

    await user.click(screen.getByRole('checkbox', { name: /已逐个指认恶魔/ }))
    await user.click(screen.getByRole('button', { name: '已给出爪牙信息' }))

    expect(screen.getByRole('button', { name: '确认本项' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: /确认并下一位/ }))

    // 下一项就是恶魔信息，三张伪装还没选。
    expect(screen.getByText('步骤说明 · 恶魔信息')).toBeInTheDocument()
    expect(screen.getByText(/还差：/)).toHaveTextContent('还差：勾选「已依次指认每一名爪牙」')
  })
})
