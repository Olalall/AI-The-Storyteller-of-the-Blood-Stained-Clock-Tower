import { FileJson, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { buildScriptQualityReport, scriptDisplayName, smartScriptPacks } from '../../domain/scripts'
import type { ScriptId, ScriptSource } from '../../domain/scripts'
import type { GameSessionState } from '../game-session/types'
import { ScriptQualityPanel } from './ScriptQualityPanel'
import './script-library.css'

interface ScriptLibrarySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: GameSessionState
  onSelectScript: (scriptId: ScriptId) => void
}

/**
 * 当前只提供不改写对局的剧本入口。
 * 真正切换必须先创建新 GameSession，避免旧时间线、配板和夜序混入新剧本。
 */
export function ScriptLibrarySheet({ open, onOpenChange, session, onSelectScript }: ScriptLibrarySheetProps) {
  const canStartBlankScript = session.playerCount === 0 && session.timeline.length === 0 && session.phaseSegments.length === 0
  const qualityReport = buildScriptQualityReport(smartScriptPacks)

  function startBlankScript(scriptId: ScriptId) {
    if (!canStartBlankScript) return
    onOpenChange(false)
    onSelectScript(scriptId)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="切换板子"
      description="新板子会从新对局开始，当前记录不会被改写。"
      contentClassName="sheet-content--script-library"
      presentation="page"
    >
      <div className="script-library">
        <section className="script-library__current" aria-labelledby="current-script-title">
          <div>
            <span>当前对局</span>
            <h3 id="current-script-title">{scriptDisplayName(session.scriptId)}</h3>
            <p>{session.playerCount > 0 ? `${session.playerCount}人 · 已有配板与记录` : '新局未开始'}</p>
          </div>
          <StatusBadge tone="success">当前使用</StatusBadge>
        </section>

        <ScriptQualityPanel report={qualityReport} currentScriptId={session.scriptId} />

        <section className="script-library__section" aria-labelledby="available-script-title">
          <div className="script-library__section-heading">
            <div><span>可开局</span><h3 id="available-script-title">已核对板子</h3></div>
            <p>只列出知识包完整的板子</p>
          </div>
          <div className="script-library__scripts">
            {smartScriptPacks.map((pack) => {
              const isCurrent = pack.scriptId === session.scriptId
              return (
                <article className="script-library__script-card" key={pack.scriptId}>
                  <div>
                    <h4>{pack.displayName}</h4>
                    <p>{pack.source.author ?? '未知作者'} · {scriptSourceLabel(pack.source)}</p>
                    <small><ShieldCheck aria-hidden="true" />{pack.playerCounts[0]}—{pack.playerCounts.at(-1)}人 · 模板 {pack.setupTemplates.length}</small>
                  </div>
                  <div className="script-library__script-actions">
                    <StatusBadge tone={canStartBlankScript ? 'warning' : isCurrent ? 'success' : 'neutral'}>{canStartBlankScript ? '可开局' : isCurrent ? '当前板子' : '新局可用'}</StatusBadge>
                    <Button variant="primary" disabled={!canStartBlankScript} onClick={() => startBlankScript(pack.scriptId)}>选择人数开局</Button>
                    {!canStartBlankScript ? <small>如需新局，先保存并重置当前局。</small> : null}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="script-library__section script-library__import" aria-labelledby="script-import-title">
          <div className="script-library__section-heading">
            <div><span>导入</span><h3 id="script-import-title">添加新板子</h3></div>
          </div>
          <p>JSON、夜序与规则知识包需要一起核对；未核对的板子不能开局或用于智能配板。</p>
          <Button variant="secondary" disabled title="剧本导入将在知识包合同完成后接入"><FileJson aria-hidden="true" />导入 JSON（待接入）</Button>
        </section>
      </div>
    </Sheet>
  )
}

function scriptSourceLabel(source: ScriptSource) {
  return source.version ?? source.verifiedAt
}
