/**
 * 本局信息浮层：core 顶行「乌鸦渡口 · 12人」标识的点击目标。
 *
 * 它承接的是纯记录模式里散在 Dashboard 工具条上的两件低频事（切换板子、开场白），
 * 外加裁决 7 给模式切换定下的唯一入口。三样东西的共同点是「它们描述这一局是什么」，
 * 而不是「主持这一局要用的工具」——所以它们属于顶行标识后面，不属于拇指弧里的工具条。
 *
 * 切换板子沿用纯记录模式已有的守卫：非空局 disabled + 一行说明。
 * 在这里放开会让一次误触把整局记录换掉，而这一层没有任何撤销。
 */
import { Repeat2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Sheet } from '../../../components/ui/Sheet'
import { OpeningScriptSheet } from '../../host-tools/OpeningScriptSheet'
import { scriptDisplayName } from '../../../domain/scripts'
import { HostingModeSection } from './HostingModeSection'
import type { GameSessionAction } from '../../game-session/state/sessionActions'
import type { GameSessionState } from '../../game-session/types'
import './grimoire-stage.css'

interface SessionInfoOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: GameSessionState
  dispatch: (action: GameSessionAction) => void
  onOpenScriptLibrary: () => void
}

export function SessionInfoOverlay({ open, onOpenChange, session, dispatch, onOpenScriptLibrary }: SessionInfoOverlayProps) {
  const isBlankSession = session.playerCount === 0
    && session.timeline.length === 0
    && session.phaseSegments.length === 0

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="本局信息"
      description="这一局是什么：剧本、人数、知识版本，以及魔典放在哪里。"
      contentClassName="session-info"
    >
      <dl className="session-info__facts">
        <div><dt>剧本</dt><dd>{scriptDisplayName(session.scriptId)}</dd></div>
        <div><dt>人数</dt><dd>{session.playerCount > 0 ? `${session.playerCount}人` : '未配座'}</dd></div>
        {/* 知识版本决定 AI 与夜序读的是哪一份规则快照；出问题时它是第一个要问的东西。 */}
        <div><dt>知识版本</dt><dd>{session.knowledgeVersion}</dd></div>
      </dl>

      <div className="session-info__tools">
        <Button
          variant="secondary"
          disabled={!isBlankSession}
          onClick={() => { onOpenChange(false); onOpenScriptLibrary() }}
        >
          <Repeat2 aria-hidden="true" />
          <span>切换板子</span>
        </Button>
        <OpeningScriptSheet sessionId={session.id} />
      </div>
      {isBlankSession ? null : (
        <p className="session-info__guard" role="note">
          已经有配板或记录，换板子会让这一局的记录对不上剧本。先在收尾里保存并重置，再换。
        </p>
      )}

      <HostingModeSection session={session} dispatch={dispatch} onSwitched={() => onOpenChange(false)} />
    </Sheet>
  )
}
