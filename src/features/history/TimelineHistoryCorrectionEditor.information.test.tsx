import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { NightActionEntry } from '../game-session/types'
import { actNight, informationSession } from '../night-workbench/state/nightInformation.test-support'
import { TimelineHistoryCorrectionEditor } from './TimelineHistoryCorrectionEditor'

describe('正式信息的日记更正', () => {
  it('没有外来者的更正仍然使用零目标，并保留原记录', async () => {
    let session = informationSession('librarian')
    session = actNight(actNight(session, { type: 'outcome', outcomeId: 'no-outsiders' }), { type: 'confirm', advance: false })
    const entry = session.timeline.findLast((item): item is NightActionEntry => item.kind === 'night_action')!
    const before = structuredClone(entry), onConfirm = vi.fn()
    render(<TimelineHistoryCorrectionEditor entry={entry} session={session} onCancel={() => {}} onConfirm={onConfirm} />)
    expect(screen.getByRole('button', { name: '更正目标1号' })).toBeDisabled()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('更正原因'), '补充主持说明')
    expect(screen.getByRole('button', { name: '确认追加' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: '确认追加' }))
    expect(onConfirm.mock.calls[0][0].record.snapshot).toMatchObject({ targets: [], roleChoice: '', outcomeId: 'no-outsiders' })
    expect(entry).toEqual(before)
  })

  it('数字更正不能改成小数或超范围，原快照保持不变', async () => {
    let session = informationSession('empath')
    session = actNight(session, { type: 'information', value: '1' })
    session = actNight(actNight(session, { type: 'outcome', outcomeId: 'record' }), { type: 'confirm', advance: false })
    const entry = session.timeline.findLast((item): item is NightActionEntry => item.kind === 'night_action')!
    const before = structuredClone(entry), onConfirm = vi.fn()
    render(<TimelineHistoryCorrectionEditor entry={entry} session={session} onCancel={() => {}} onConfirm={onConfirm} />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('更正原因'), '更正正式告知')
    const field = screen.getByLabelText('告知')
    for (const value of ['1.5', '3', '']) {
      await user.clear(field)
      if (value) await user.type(field, value)
      expect(screen.getByRole('button', { name: '确认追加' })).toBeDisabled()
    }
    await user.type(field, '0')
    await user.click(screen.getByRole('button', { name: '确认追加' }))
    expect(onConfirm.mock.calls[0][0].record.snapshot.informationGiven).toBe('0')
    expect(entry).toEqual(before)
  })
})
