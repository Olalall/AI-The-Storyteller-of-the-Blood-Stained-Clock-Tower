import { Check, Eye, EyeOff, IdCard, RotateCcw, ShieldQuestion, Shuffle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { RoleDisc } from '../../components/ui/RoleDisc'
import { Sheet } from '../../components/ui/Sheet'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { projectConfirmedSetup, projectStorytellerSeatSummaries, type StorytellerSeatSummary } from '../game-session/state/projectors'
import type { GameSessionState } from '../game-session/types'
import { loadIdentityDealReceipts, saveIdentityDealReceipts, type IdentityDealReceipts } from '../../services/identity-deal'
import { playerFacingIdentity } from './identityProjection'
import './identity-deal.css'

interface IdentityDealSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: GameSessionState
}

type DealMode = 'screen' | 'cards'

function seatTitle(seat: StorytellerSeatSummary | null) {
  if (!seat) return '未选择'
  return `${seat.seatId}号${seat.nickname ? ` · ${seat.nickname}` : ''}`
}

function cardModeSeatLabel(received: boolean) {
  return received ? '已领取' : '未领取'
}

export function IdentityDealSheet({ open, onOpenChange, session }: IdentityDealSheetProps) {
  const seats = useMemo(() => projectStorytellerSeatSummaries(session), [session])
  const confirmedSetup = useMemo(() => projectConfirmedSetup(session), [session])
  const [mode, setMode] = useState<DealMode>('screen')
  const [selectedSeatId, setSelectedSeatId] = useState<number>(1)
  const [spotlightSeatId, setSpotlightSeatId] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [receipts, setReceipts] = useState<IdentityDealReceipts>({})
  const selectedSeat = seats.find((seat) => seat.seatId === selectedSeatId) ?? seats[0] ?? null
  const spotlightSeat = spotlightSeatId ? seats.find((seat) => seat.seatId === spotlightSeatId) ?? null : null
  const selectedFacing = selectedSeat && confirmedSetup
    ? playerFacingIdentity(session.scriptId, selectedSeat.seatId, confirmedSetup.draft.assignments)
    : { role: null, ability: '身份未确认。', privateNote: '' }
  const spotlightFacing = spotlightSeat && confirmedSetup
    ? playerFacingIdentity(session.scriptId, spotlightSeat.seatId, confirmedSetup.draft.assignments)
    : { role: null, ability: '身份未确认。', privateNote: '' }
  const receivedCount = seats.filter((seat) => receipts[seat.seatId]).length

  useEffect(() => {
    if (!open) return
    setReceipts(loadIdentityDealReceipts(session.id))
    setSelectedSeatId((current) => seats.some((seat) => seat.seatId === current) ? current : seats[0]?.seatId ?? 1)
  }, [open, seats, session.id])

  function updateReceipts(nextReceipts: IdentityDealReceipts) {
    setReceipts(nextReceipts)
    saveIdentityDealReceipts(session.id, nextReceipts)
  }

  function markReceived(seatId: number) {
    updateReceipts({ ...receipts, [seatId]: new Date().toISOString() })
  }

  function undoReceived(seatId: number) {
    const nextReceipts = { ...receipts }
    delete nextReceipts[seatId]
    updateReceipts(nextReceipts)
  }

  function openSpotlight(seatId: number) {
    setSpotlightSeatId(seatId)
    setRevealed(false)
  }

  function closeSpotlight() {
    setSpotlightSeatId(null)
    setRevealed(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) closeSpotlight()
    onOpenChange(nextOpen)
  }

  function switchMode(nextMode: DealMode) {
    closeSpotlight()
    setMode(nextMode)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={handleOpenChange}
      title="发身份"
      description="屏幕领取 · 实体抽牌"
      contentClassName="sheet-content--identity-deal"
      presentation="page"
    >
      <div className="identity-deal">
        <header className="identity-deal__hero">
          <div>
            <span>本局 · 发身份</span>
            <strong>{receivedCount}/{seats.length}</strong>
            <small>领取进度</small>
          </div>
          <div className="identity-deal__mode-switch" role="tablist" aria-label="发身份方式">
            <button type="button" className={mode === 'screen' ? 'is-active' : ''} onClick={() => switchMode('screen')}><IdCard aria-hidden="true" />屏幕领取</button>
            <button type="button" className={mode === 'cards' ? 'is-active' : ''} onClick={() => switchMode('cards')}><Shuffle aria-hidden="true" />实体抽牌</button>
          </div>
        </header>

        {!confirmedSetup ? <section className="identity-deal__empty">
          <ShieldQuestion aria-hidden="true" />
          <strong>先确认配板</strong>
        </section> : <div className="identity-deal__layout">
          <section className="identity-deal__seat-panel" aria-label="座位领取状态">
            <div className="identity-deal__section-heading">
              <span>{mode === 'screen' ? '叫号领取' : '抽牌核对'}</span>
              <StatusBadge tone={receivedCount === seats.length ? 'success' : 'warning'}>{receivedCount === seats.length ? '已完成' : '进行中'}</StatusBadge>
            </div>
            <div className="identity-deal__seat-grid">
              {seats.map((seat) => {
                const received = Boolean(receipts[seat.seatId])
                const visibleRole = mode === 'screen' ? seat.role?.name ?? '未确认' : cardModeSeatLabel(received)
                return <button
                  type="button"
                  key={seat.seatId}
                  className={`${seat.seatId === selectedSeatId ? 'is-selected ' : ''}${received ? 'is-received' : ''}`}
                  onClick={() => setSelectedSeatId(seat.seatId)}
                  aria-label={`${seat.seatId}号 ${mode === 'screen' ? seat.role?.name ?? '未确认' : '实体牌'} ${received ? '已领取' : '未领取'}`}
                >
                  <span>{seat.seatId}号</span>
                  <strong>{visibleRole}</strong>
                  <small>{seat.nickname || '玩家'}</small>
                  {received ? <Check aria-hidden="true" /> : null}
                </button>
              })}
            </div>
          </section>

          <aside className="identity-deal__current" aria-label="当前领取">
            <div className="identity-deal__section-heading">
              <span>{mode === 'screen' ? '单人展示' : '实体牌'}</span>
              <StatusBadge tone={selectedSeat && receipts[selectedSeat.seatId] ? 'success' : 'neutral'}>
                {selectedSeat && receipts[selectedSeat.seatId] ? '已领取' : '未领取'}
              </StatusBadge>
            </div>
            <div className="identity-deal__current-card">
              {mode === 'screen' ? <RoleDisc
                  initial={selectedFacing.role?.initial ?? '?'}
                  roleName={selectedFacing.role?.name ?? '未确认'}
                  imageSrc={selectedFacing.role?.iconPath}
                  concealed
                  size="large"
                /> : <div className="identity-deal__card-token" aria-hidden="true"><Shuffle /></div>}
              <div>
                <strong>{seatTitle(selectedSeat)}</strong>
                <span>{mode === 'screen' ? selectedFacing.privateNote || '默认遮住' : '只记录领取进度'}</span>
              </div>
            </div>
            {mode === 'screen' ? <Button variant="primary" disabled={!selectedFacing.role} onClick={() => selectedSeat && openSpotlight(selectedSeat.seatId)}>
              <Eye aria-hidden="true" />打开单人展示
            </Button> : <Button variant="primary" disabled={!selectedSeat} onClick={() => selectedSeat && markReceived(selectedSeat.seatId)}>
              <Check aria-hidden="true" />标记已领取
            </Button>}
            <Button variant="ghost" disabled={!selectedSeat || !receipts[selectedSeat.seatId]} onClick={() => selectedSeat && undoReceived(selectedSeat.seatId)}>
              <RotateCcw aria-hidden="true" />撤销领取
            </Button>
          </aside>
        </div>}
      </div>

      {spotlightSeat ? <div className="identity-spotlight" role="dialog" aria-modal="true" aria-label={`${spotlightSeat.seatId}号单人身份展示`}>
        <div className="identity-spotlight__card">
          <header>
            <span>{seatTitle(spotlightSeat)}</span>
            <Button variant="ghost" compact onClick={closeSpotlight}><EyeOff aria-hidden="true" />返回遮蔽</Button>
          </header>
          {revealed ? <section className="identity-spotlight__identity">
            <RoleDisc
              initial={spotlightFacing.role?.initial ?? '?'}
              roleName={spotlightFacing.role?.name ?? '未确认'}
              imageSrc={spotlightFacing.role?.iconPath}
              size="large"
              active
            />
            <strong>{spotlightFacing.role?.name ?? '未确认'}</strong>
            <p>{spotlightFacing.ability}</p>
          </section> : <section className="identity-spotlight__shield">
            <EyeOff aria-hidden="true" />
            <strong>身份已遮住</strong>
          </section>}
          <footer>
            <Button variant="secondary" onClick={() => setRevealed((value) => !value)}>
              {revealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              {revealed ? '遮住身份' : '显示身份'}
            </Button>
            <Button variant="primary" disabled={!revealed} onClick={() => {
              markReceived(spotlightSeat.seatId)
              closeSpotlight()
            }}>
              <Check aria-hidden="true" />已领取
            </Button>
          </footer>
        </div>
      </div> : null}
    </Sheet>
  )
}
