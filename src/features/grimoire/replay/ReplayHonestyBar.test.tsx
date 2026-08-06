import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ReplayHonestyBar } from './ReplayHonestyBar'
import type { ReplayContext } from './writeAccess'

const RECORD_ARCHIVE: ReplayContext = {
  archive: {
    hostingMode: 'record',
    hostingModeHistory: [],
    grimoireCompleteness: { seatsWithRole: 12, totalSeats: 12, stateChangeCount: 0, markerCount: 0 },
  },
  viewMode: 'grimoire',
}

describe('ReplayHonestyBar', () => {
  it('is resident: there is no way to dismiss it', () => {
    // 它是免责声明不是提示。能关掉的免责声明等于没有——
    // 而回看往往正发生在争议现场，那一刻最想把它关掉的就是被质疑的人。
    render(<ReplayHonestyBar context={RECORD_ARCHIVE} />)

    expect(screen.getByRole('note', { name: '回看说明' })).toBeInTheDocument()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('puts the 没记录 / 没发生 distinction on screen, not just in the model', () => {
    render(<ReplayHonestyBar context={RECORD_ARCHIVE} />)

    expect(screen.getByText(/当时没有录入，不表示当时没有这个状态/)).toBeInTheDocument()
    expect(screen.getByText(/12\/12 个座位的身份/)).toBeInTheDocument()
    expect(screen.getByText(/补不了录/)).toBeInTheDocument()
  })

  it('renders nothing at all while the game is still running', () => {
    // 常驻是回看态的属性，不是魔典的属性。进行中的对局多一条横条，
    // 就等于每局都在首屏挂一句与这一局无关的话。
    const { container } = render(<ReplayHonestyBar context={{ archive: null, viewMode: 'grimoire' }} />)

    expect(container).toBeEmptyDOMElement()
  })
})
