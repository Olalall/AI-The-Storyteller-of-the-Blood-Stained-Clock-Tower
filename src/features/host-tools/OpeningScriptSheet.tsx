import { BookOpenText, Maximize2, Pencil, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import {
  defaultOpeningScript,
  readOpeningScript,
  restoreDefaultOpeningScript,
  saveOpeningScript,
} from '../../services/opening-script'
import './opening-script.css'

interface OpeningScriptSheetProps {
  sessionId: string
}

export function OpeningScriptSheet({ sessionId }: OpeningScriptSheetProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState(() => readOpeningScript(sessionId))
  const [draft, setDraft] = useState(content)
  const [editing, setEditing] = useState(false)
  const [displaying, setDisplaying] = useState(false)

  useEffect(() => {
    const next = readOpeningScript(sessionId)
    setContent(next)
    setDraft(next)
    setEditing(false)
    setDisplaying(false)
  }, [sessionId])

  function closeOrOpen(nextOpen: boolean) {
    if (!nextOpen) {
      setDraft(content)
      setEditing(false)
      setDisplaying(false)
    }
    setOpen(nextOpen)
  }

  function startEditing() {
    setDraft(content)
    setEditing(true)
  }

  function saveDraft() {
    const next = draft.trim()
    if (!next) return
    saveOpeningScript(sessionId, next)
    setContent(next)
    setDraft(next)
    setEditing(false)
  }

  function restoreDefault() {
    const next = restoreDefaultOpeningScript(sessionId)
    setContent(next)
    setDraft(next)
    setEditing(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={closeOrOpen}
      title="开场白"
      description="仅供说书人查看或展示；不会写入本局。"
      presentation="page"
      trigger={<Button variant="secondary" compact><BookOpenText aria-hidden="true" />开场白</Button>}
    >
      <div className="opening-script">
        {displaying ? <section className="opening-script__display" aria-label="开场白大字展示">
          <span>开场白</span>
          <p>{content}</p>
          <Button variant="secondary" onClick={() => setDisplaying(false)}>退出展示</Button>
        </section> : editing ? <section className="opening-script__editor" aria-label="编辑开场白">
          <label>开场白文案
            <textarea aria-label="开场白文案" value={draft} maxLength={1600} onChange={(event) => setDraft(event.target.value)} />
          </label>
          <div className="opening-script__actions">
            <Button variant="ghost" onClick={() => { setDraft(content); setEditing(false) }}>取消编辑</Button>
            <Button variant="secondary" onClick={restoreDefault}><RotateCcw aria-hidden="true" />恢复默认</Button>
            <Button variant="primary" disabled={!draft.trim()} onClick={saveDraft}>保存文案</Button>
          </div>
        </section> : <section className="opening-script__preview" aria-label="开场白预览">
          <span>当前文案</span>
          <p>{content}</p>
          <div className="opening-script__actions">
            <Button variant="secondary" onClick={startEditing}><Pencil aria-hidden="true" />编辑文案</Button>
            <Button variant="primary" onClick={() => setDisplaying(true)}><Maximize2 aria-hidden="true" />大字展示</Button>
          </div>
          {content !== defaultOpeningScript ? <Button variant="ghost" className="opening-script__restore" onClick={restoreDefault}><RotateCcw aria-hidden="true" />恢复默认</Button> : null}
        </section>}
      </div>
    </Sheet>
  )
}
