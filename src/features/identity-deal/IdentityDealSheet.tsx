import { Check, Eye, EyeOff, IdCard, RotateCcw, ShieldQuestion, Shuffle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { RoleDisc } from '../../components/ui/RoleDisc'
import { Sheet } from '../../components/ui/Sheet'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { projectConfirmedSetup, projectCurrentAssignments, projectStorytellerSeatSummaries, type StorytellerSeatSummary } from '../game-session/state/projectors'
import type { GameSessionAction } from '../game-session/state/sessionReducer'
import type { GameSessionState } from '../game-session/types'
import { loadIdentityDealReceipts, saveIdentityDealReceipts, type IdentityDealReceipts } from '../../services/identity-deal'
import { identityRoleChoices, playerFacingIdentity, receiptMatchesCurrentIdentity } from './identityProjection'
import { IdentityPresentationEditor } from './IdentityPresentationEditor'
import './identity-deal.css'

interface IdentityDealSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: GameSessionState
  dispatch?: React.Dispatch<GameSessionAction>
}

type DealMode = 'screen' | 'cards'

function seatTitle(seat: StorytellerSeatSummary | null) {
  if (!seat) return '未选择'
  return `${seat.seatId}号${seat.nickname ? ` · ${seat.nickname}` : ''}`
}

function cardModeSeatLabel(received: boolean) {
  return received ? '已领取' : '未领取'
}

export function IdentityDealSheet({ open, onOpenChange, session, dispatch }: IdentityDealSheetProps) {
  const seats = useMemo(() => projectStorytellerSeatSummaries(session), [session])
  const confirmedSetup = useMemo(() => projectConfirmedSetup(session), [session])
  const assignments = useMemo(() => projectCurrentAssignments(session), [session])
  const [mode, setMode] = useState<DealMode>('screen')
  const [selectedSeatId, setSelectedSeatId] = useState<number>(1)
  const [spotlightSeatId, setSpotlightSeatId] = useState<number | null>(null)
  const [handoff, setHandoff] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [receipts, setReceipts] = useState<IdentityDealReceipts>({})
  const [notice, setNotice] = useState('')
  const selectedSeat = seats.find((seat) => seat.seatId === selectedSeatId) ?? seats[0] ?? null
  const spotlightSeat = spotlightSeatId ? seats.find((seat) => seat.seatId === spotlightSeatId) ?? null : null
  const selectedFacing = selectedSeat && confirmedSetup
    ? playerFacingIdentity(session, selectedSeat.seatId)
    : { role: null, ability: '身份未确认。', privateNote: '' }
  const spotlightFacing = spotlightSeat && confirmedSetup
    ? playerFacingIdentity(session, spotlightSeat.seatId)
    : { role: null, ability: '身份未确认。', privateNote: '' }
  const isReceived = (seatId: number) => receiptMatchesCurrentIdentity(session, seatId, receipts[seatId])
  const receivedCount = seats.filter((seat) => isReceived(seat.seatId)).length

  useEffect(() => {
    if (!open) return
    setReceipts(loadIdentityDealReceipts(session.id))
    setSelectedSeatId((current) => seats.some((seat) => seat.seatId === current) ? current : seats[0]?.seatId ?? 1)
  }, [open, seats, session.id])

  function updateReceipts(nextReceipts: IdentityDealReceipts) {
    try {
      saveIdentityDealReceipts(session.id, nextReceipts)
      setReceipts(nextReceipts)
      setNotice('')
    } catch { setNotice('领取进度未保存，请保留当前页面并检查存储空间。') }
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
    setHandoff(false)
    setSpotlightSeatId(seatId)
    setRevealed(false)
  }

  function closeSpotlight() {
    setSpotlightSeatId(null)
    setRevealed(false)
    setHandoff(true)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && (spotlightSeat || handoff)) return
    onOpenChange(nextOpen)
  }

  function switchMode(nextMode: DealMode) {
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
      dismissible={!spotlightSeat && !handoff}
    >
      {!spotlightSeat && !handoff ? <div className="identity-deal">
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
                const received = isReceived(seat.seatId)
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
              <StatusBadge tone={selectedSeat && isReceived(selectedSeat.seatId) ? 'success' : 'neutral'}>
                {selectedSeat && isReceived(selectedSeat.seatId) ? '已领取' : '未领取'}
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
              <div className="identity-deal__current-copy">
                <strong>{seatTitle(selectedSeat)}</strong>
                <span>{mode === 'screen' ? selectedFacing.privateNote || '默认遮住' : '只记录领取进度'}</span>
              </div>
            </div>
            {mode === 'screen' && selectedSeat?.role && 'requiresPresentation' in selectedFacing && selectedFacing.requiresPresentation ? <IdentityPresentationEditor
              seatId={selectedSeat.seatId}
              roles={identityRoleChoices(session.scriptId, selectedSeat.role.id, assignments)}
              currentRoleId={selectedFacing.role?.id}
              onConfirm={dispatch ? (shownRoleId) => dispatch({ type: 'confirm-identity-presentation', seatId: selectedSeat.seatId, actualRoleId: selectedSeat.role!.id, shownRoleId, confirmedAt: new Date().toISOString() }) : undefined}
            /> : null}
            {mode === 'screen' && !selectedFacing.role ? <p role="status">{selectedFacing.ability}</p> : null}
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
        {notice ? <p role="alert">{notice}</p> : null}
      </div> : null}

      {spotlightSeat ? <Sheet open onOpenChange={(nextOpen) => { if (!nextOpen) closeSpotlight() }} title={`${spotlightSeat.seatId}号单人身份展示`} description="只展示当前座位。退出后先遮蔽身份，再将设备交还说书人。" presentation="page" layer="nested" contentClassName="sheet-content--identity-private">
        <div className="identity-spotlight">
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
        </div>
      </Sheet> : null}

      {handoff ? <Sheet open onOpenChange={() => undefined} title="请交还设备给说书人" description="本次身份展示已结束，所有身份已遮住。" presentation="page" layer="nested" dismissible={false} contentClassName="sheet-content--identity-private">
        <div className="identity-spotlight identity-spotlight--handoff">
          <section className="identity-spotlight__shield">
            <EyeOff aria-hidden="true" />
            <strong>身份已遮住</strong>
            <p>请将设备交还说书人，再继续发身份。</p>
            {notice ? <p role="alert">{notice}</p> : null}
            <Button variant="primary" onClick={() => setHandoff(false)}>说书人继续发身份</Button>
          </section>
        </div>
      </Sheet> : null}
    </Sheet>
  )
}
