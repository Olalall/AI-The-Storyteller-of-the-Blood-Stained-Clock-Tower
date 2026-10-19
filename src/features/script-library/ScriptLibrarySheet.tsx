import { AlertTriangle, Repeat2, Search } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { scriptDisplayName, scriptManifest } from '../../domain/scripts'
import type { ScriptId } from '../../domain/scripts'
import { projectConfirmedSetup } from '../game-session/state/projectors'
import type { GameSessionState } from '../game-session/types'
import './script-library.css'

interface ScriptLibrarySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: GameSessionState
  onSelectScript: (scriptId: ScriptId) => void
  onRequestResetSwitch: (scriptId: ScriptId) => void
}

/**
 * 当前只提供不改写对局的剧本入口。
 * 真正切换必须先创建新 GameSession，避免旧时间线、配板和夜序混入新剧本。
 */
export function ScriptLibrarySheet({ open, onOpenChange, session, onSelectScript, onRequestResetSwitch }: ScriptLibrarySheetProps) {
  const [pendingScriptId, setPendingScriptId] = useState<ScriptId | null>(null)
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')
  const filteredScripts = scriptManifest.filter((pack) => `${pack.displayName} ${pack.scriptId}`.toLocaleLowerCase('zh-CN').includes(normalizedQuery))
  const setupConfirmed = Boolean(projectConfirmedSetup(session))
  const pendingScript = scriptManifest.find((pack) => pack.scriptId === pendingScriptId)

  function confirmDirectSwitch() {
    if (!pendingScriptId || setupConfirmed) return
    onSelectScript(pendingScriptId)
    setPendingScriptId(null)
  }

  function continueWithReset() {
    if (!pendingScriptId || !setupConfirmed) return
    onRequestResetSwitch(pendingScriptId)
    setPendingScriptId(null)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="切换板子"
      description="选择本局板子"
      contentClassName="sheet-content--script-library"
      presentation="page"
    >
      <div className="script-library">
        <section className="script-library__current" aria-labelledby="current-script-title">
          <div>
            <span>当前对局</span>
            <h3 id="current-script-title">{scriptDisplayName(session.scriptId)}</h3>
          </div>
          <StatusBadge tone="success">当前使用</StatusBadge>
        </section>

        <section className="script-library__section" aria-labelledby="available-script-title">
          <div className="script-library__section-heading">
            <div><span>板子</span><h3 id="available-script-title">选择板子</h3></div>
          </div>
          <label className="script-library__search">
            <span>搜索板子</span>
            <span className="script-library__search-control"><Search aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="名称或 ID" autoComplete="off" /></span>
          </label>
          <p className="script-library__result-count" aria-live="polite">{normalizedQuery ? `找到 ${filteredScripts.length} 个板子` : `共 ${scriptManifest.length} 个板子`}</p>
          <div className="script-library__scripts">
            {filteredScripts.map((pack) => {
              return (
                <article className="script-library__script-card" key={pack.scriptId}>
                  <div>
                    <h4>{pack.displayName}</h4>
                  </div>
                  <div className="script-library__script-actions">
                    {pack.scriptId === session.scriptId
                      ? <StatusBadge tone="success">当前</StatusBadge>
                      : <Button className="script-library__select-button" variant="secondary" onClick={() => setPendingScriptId(pack.scriptId)}>切换到此板子</Button>}
                  </div>
                </article>
              )
            })}
            {filteredScripts.length === 0 ? <p role="status">没有找到匹配的板子，换一个名称或 ID 试试。</p> : null}
          </div>
        </section>
      </div>

      <Sheet
        open={Boolean(pendingScriptId)}
        onOpenChange={(nextOpen) => { if (!nextOpen) setPendingScriptId(null) }}
        title="确认切换板子"
        description={pendingScript ? `目标板子：${pendingScript.displayName}` : '确认目标板子'}
        contentClassName="sheet-content--script-confirm"
        layer="nested"
      >
        <div className="script-switch-confirm">
          <div className="script-switch-confirm__summary">
            {setupConfirmed ? <AlertTriangle aria-hidden="true" /> : <Repeat2 aria-hidden="true" />}
            <div>
              <strong>{setupConfirmed ? '当前配板已经确认' : '切换会重新建立配板'}</strong>
              <p>{setupConfirmed
                ? '为避免玩家已经看到身份后角色被改写，本局不能直接切换板子。'
                : '当前未确认的配板会被替换，玩家人数、昵称和经验会继续保留。'}</p>
            </div>
          </div>
          <ul>
            <li>目标板子将成为新配板的唯一角色来源。</li>
            <li>{setupConfirmed ? '确认重置后会自动留档，再在新局使用目标板子。' : '切换后仍需由说书人检查并确认配板。'}</li>
            <li>身份、阵营和胜负不会由系统自动裁定。</li>
          </ul>
          <div className="script-switch-confirm__actions">
            <Button variant="ghost" onClick={() => setPendingScriptId(null)}>取消</Button>
            {setupConfirmed
              ? <Button variant="primary" onClick={continueWithReset}>前往重置确认</Button>
              : <Button variant="primary" onClick={confirmDirectSwitch}>确认切换</Button>}
          </div>
        </div>
      </Sheet>
    </Sheet>
  )
}
