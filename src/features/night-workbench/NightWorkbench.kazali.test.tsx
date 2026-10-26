import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useReducer } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { projectCurrentAssignments, projectCurrentPlayerStates } from '../game-session/state/projectors'
import { gameSessionReducer } from '../game-session/state/sessionReducer'
import type { NightActionEntry } from '../game-session/types'
import { TimelineHistoryCorrectionEditor } from '../history/TimelineHistoryCorrectionEditor'
import { NightWorkbench } from './NightWorkbench'
import { currentKazali, fillKazaliPairs, kazaliPairSession } from './state/kazaliPairs.test-support'
import { actNight } from './state/nightInformation.test-support'

describe('Kazali first-night paired form', () => {
  it('records three ordered player/Minion pairs with no public reveal and keeps authority unchanged until separate confirmation', async () => {
    let latest = kazaliPairSession()
    const assignments = projectCurrentAssignments(latest), states = projectCurrentPlayerStates(latest)
    const choices = currentKazali(latest).item.roleChoices!
    function Harness() {
      const [session, dispatchSession] = useReducer(gameSessionReducer, latest)
      latest = session
      return <NightWorkbench sessionBinding={{ session, dispatchSession }} onExit={() => {}} />
    }
    render(<Harness />)
    const user = userEvent.setup()
    expect(screen.getAllByRole('combobox')).toHaveLength(6)
    expect(screen.getByRole('button', { name: '记录结果' })).toBeDisabled()
    expect(screen.getByText(/补齐3组玩家与爪牙/)).toBeInTheDocument()
    for (const index of [0, 1, 2]) {
      const target = screen.getByRole('combobox', { name: `第${index + 1}组玩家` })
      const role = screen.getByRole('combobox', { name: `第${index + 1}组爪牙` })
      expect(within(role).queryByRole('option', { name: '卡扎力' })).toBeNull()
      expect(within(role).queryByRole('option', { name: '事务官' })).toBeNull()
      await user.selectOptions(target, String([6, 2, 4][index]))
      await user.selectOptions(role, choices[index].id)
      if (index < 2) expect(screen.getByRole('button', { name: '记录结果' })).toBeDisabled()
    }
    expect(within(screen.getByRole('combobox', { name: '第2组玩家' })).getByRole('option', { name: '6号 博学者 · 存活' })).toBeDisabled()
    expect(within(screen.getByRole('combobox', { name: '第2组爪牙' })).getByRole('option', { name: choices[0].label })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '记录结果' }))
    expect(screen.queryByRole('button', { name: '展示信息' })).toBeNull()
    expect(screen.getByRole('button', { name: '确认本项' })).toBeEnabled()
    expect(currentKazali(latest).draft.playerChoice).toBe(`6号 → ${choices[0].label}；2号 → ${choices[1].label}；4号 → ${choices[2].label}`)
    await user.click(screen.getByRole('button', { name: '确认本项' }))
    expect(projectCurrentAssignments(latest)).toEqual(assignments)
    expect(projectCurrentPlayerStates(latest)).toEqual(states)
    expect(screen.getAllByRole('combobox').every((select) => (select as HTMLSelectElement).disabled || Boolean(select.closest('fieldset[disabled]')))).toBe(true)
    const original = structuredClone(currentKazali(latest).state.confirmedRecords[currentKazali(latest).item.id][0])
    await user.click(screen.getByRole('button', { name: '追加更正' }))
    await user.selectOptions(screen.getByRole('combobox', { name: '第1组玩家' }), '1')
    expect(screen.getByRole('button', { name: '确认更正' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '记录结果' }))
    await user.click(screen.getByRole('button', { name: '确认更正' }))
    const records = currentKazali(latest).state.confirmedRecords[currentKazali(latest).item.id]
    expect(records).toHaveLength(2)
    expect(records[0]).toEqual(original)
    expect(records[1]).toMatchObject({ correctionOf: original.id, snapshot: { targets: [1, 2, 4], informationGiven: '' } })
  })

  it('hides every pairing input while privacy is shielded', async () => {
    let latest = fillKazaliPairs(kazaliPairSession())
    latest = actNight(latest, { type: 'set-privacy', shielded: true })
    function Harness() {
      const [session, dispatchSession] = useReducer(gameSessionReducer, latest)
      latest = session
      return <NightWorkbench sessionBinding={{ session, dispatchSession }} onExit={() => {}} />
    }
    render(<Harness />)
    expect(screen.queryByRole('combobox')).toBeNull()
    await userEvent.setup().click(screen.getByRole('button', { name: '解除遮蔽' }))
    expect(screen.getAllByRole('combobox')).toHaveLength(6)
    expect(screen.getByRole('combobox', { name: '第1组玩家' })).toHaveValue('6')
  })

  it('preserves structured pairings when a diary correction only changes wording', async () => {
    let session = fillKazaliPairs(kazaliPairSession())
    session = actNight(actNight(session, { type: 'outcome', outcomeId: 'record' }), { type: 'confirm', advance: false })
    const entry = session.timeline.findLast((item): item is NightActionEntry => item.kind === 'night_action')!
    const before = JSON.stringify(entry), onConfirm = vi.fn()
    render(<TimelineHistoryCorrectionEditor entry={entry} session={session} onCancel={() => {}} onConfirm={onConfirm} />)
    const user = userEvent.setup()
    expect(screen.getByRole('button', { name: '更正目标1号' })).toBeDisabled()
    expect(screen.queryByLabelText('告知')).toBeNull()
    await user.clear(screen.getByLabelText('选择'))
    await user.type(screen.getByLabelText('选择'), '补充口头说明，配对未变')
    await user.type(screen.getByLabelText('更正原因'), '修正记录用语')
    await user.click(screen.getByRole('button', { name: '确认追加' }))
    expect(onConfirm).toHaveBeenCalledOnce()
    const correction = onConfirm.mock.calls[0][0]
    expect(correction.record.snapshot.targetRoleChoices).toEqual(entry.record.snapshot.targetRoleChoices)
    expect(correction.record.snapshot.targetRoleChoices).not.toBe(entry.record.snapshot.targetRoleChoices)
    expect(correction.record.snapshot.targets).toEqual([6, 2, 4])
    expect(correction.record.snapshot.playerChoice).toBe('补充口头说明，配对未变')
    expect(JSON.stringify(entry)).toBe(before)
  })
})
