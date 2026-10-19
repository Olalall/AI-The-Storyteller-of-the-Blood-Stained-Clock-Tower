import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useReducer } from 'react'
import { describe, expect, it } from 'vitest'
import { projectCurrentAssignments, projectCurrentPlayerStates } from '../game-session/state/projectors'
import { gameSessionReducer } from '../game-session/state/sessionReducer'
import { playerFacingIdentity } from '../identity-deal/identityProjection'
import { NightWorkbench } from './NightWorkbench'
import { allocateMarionette, focusNightItem, marionetteOpening } from './state/marionettePretend.test-support'
import { projected } from './state/nightInformation.test-support'

describe('Marionette pretend reminder UI', () => {
  it('offers only a manual pretend confirmation with no AI, original ability target or player revelation', async () => {
    let latest = allocateMarionette(marionetteOpening())
    const fake = projected(latest).queue.find((item) => item.interactionVersion === 'marionette/pretend-v1')!
    expect(fake).toBeDefined()
    latest = focusNightItem(latest, fake.id)
    const assignments = projectCurrentAssignments(latest), statuses = projectCurrentPlayerStates(latest)
    const identity = playerFacingIdentity(latest, 1)
    function Harness() {
      const [session, dispatchSession] = useReducer(gameSessionReducer, latest)
      latest = session
      return <NightWorkbench sessionBinding={{ session, dispatchSession }} onExit={() => {}} />
    }
    render(<Harness />)
    expect(screen.queryByRole('button', { name: 'AI推荐' })).toBeNull()
    expect(screen.queryByRole('combobox')).toBeNull()
    expect(screen.queryByRole('button', { name: /^选择\d+号玩家/ })).toBeNull()
    expect(screen.queryByRole('button', { name: '展示信息' })).toBeNull()
    expect(screen.queryByText(/首夜爪牙分配\s+\d/)).toBeNull()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '已完成假装流程' }))
    await user.click(screen.getByRole('button', { name: '确认本项' }))
    const record = projected(latest).confirmedRecords[fake.id].at(-1)!
    expect(record.snapshot.informationGiven).toBe('')
    expect(record.snapshot.targets).toEqual([])
    expect(record.snapshot.targetRoleChoices).toBeUndefined()
    expect(record.snapshot.storytellerResult).toMatch(/假装流程.*无真实效果/)
    expect(projectCurrentAssignments(latest)).toEqual(assignments)
    expect(projectCurrentPlayerStates(latest)).toEqual(statuses)
    expect(playerFacingIdentity(latest, 1)).toEqual(identity)
    expect(identity.role?.id).toBe('highpriestess')
  })
})
