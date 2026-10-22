import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { Field } from '../../components/ui/Field'
import { loadSmartScriptPack, scriptManifest, scriptDisplayName, type SmartScriptPack } from '../../domain/scripts'
import { askRulesAdvisor } from '../../services/ai/rulesAdvisorHttp'
import { readAIRuntimeSettings } from '../../services/ai/aiRuntimeSettings'
import type { RulesAdvisorAnswer as Answer } from '../../services/ai/rulesAdvisorTypes'
import { readBackendAIStatus, type BackendAIStatus } from '../ai-settings/backendAIStatus'
import { AIAccessSettings } from '../ai-settings/AIAccessSettings'
import { RulesAdvisorAnswer } from './RulesAdvisorAnswer'
import './rules-advisor.css'

type Turn = { question: string; answer: Answer; key: string }

export function RulesAdvisorSheet({ open, onOpenChange, initialScriptId, concealed }: {
  open: boolean; onOpenChange: (open: boolean) => void; initialScriptId: string; concealed: boolean
}) {
  const [scriptId, setScriptId] = useState(initialScriptId), [roleId, setRoleId] = useState('')
  const [search, setSearch] = useState(''), [pack, setPack] = useState<SmartScriptPack | null>(null)
  const [question, setQuestion] = useState(''), [turns, setTurns] = useState<Turn[]>([])
  const [status, setStatus] = useState<BackendAIStatus | null>(null), [error, setError] = useState('')
  const [busy, setBusy] = useState(false), [loadingPack, setLoadingPack] = useState(false)
  const request = useRef<AbortController | null>(null), conversation = useRef<HTMLDivElement>(null)
  const runtime = readAIRuntimeSettings()
  const contextKey = `${scriptId}:${roleId}`
  const choices = scriptManifest.filter(script => script.scriptId === scriptId || `${script.displayName} ${script.scriptId}`.toLowerCase().includes(search.trim().toLowerCase()))
  const scopeLabel = `${scriptDisplayName(scriptId)} · ${pack?.roles.find(role => role.id === roleId)?.name ?? '全板'}`
  async function refreshStatus() { setStatus(await readBackendAIStatus(readAIRuntimeSettings())) }
  useEffect(() => {
    if (!open || concealed) return
    let active = true
    readBackendAIStatus(readAIRuntimeSettings()).then(next => { if (active) setStatus(next) })
    return () => { active = false }
  }, [open, concealed])
  useEffect(() => {
    let active = true
    setLoadingPack(true); setPack(null); setError('')
    loadSmartScriptPack(scriptId).then(next => { if (active) setPack(next) }).catch(() => { if (active) setError('板子资料加载失败，请重新选择板子。') }).finally(() => { if (active) setLoadingPack(false) })
    return () => { active = false }
  }, [scriptId])
  useEffect(() => () => { request.current?.abort() }, [])
  useEffect(() => { if (concealed) request.current?.abort() }, [concealed])
  useEffect(() => {
    const log = conversation.current
    if (open && !concealed && log) log.scrollTop = busy ? log.scrollHeight : log.querySelector<HTMLElement>('article:last-of-type')?.offsetTop ?? 0
  }, [turns, busy, open, concealed])

  async function send() {
    if (busy || !question.trim() || !pack || concealed || status?.state !== 'ready') return
    const controller = new AbortController()
    request.current = controller; setBusy(true); setError('')
    const asked = question.trim()
    try {
      const history = turns.filter(turn => turn.key === contextKey).slice(-4).map(turn => ({ question: turn.question,
        answer: JSON.stringify({ summary: turn.answer.summary, ruleFacts: turn.answer.ruleFacts, considerations: turn.answer.considerations, missingFacts: turn.answer.missingFacts }).slice(0, 6000) }))
      const answer = await askRulesAdvisor({ scriptId, ...(roleId ? { roleId } : {}), question: asked, history }, controller.signal)
      if (!controller.signal.aborted) { setTurns(previous => [...previous, { question: asked, answer, key: contextKey }]); setQuestion('') }
    } catch (failure) {
      if (!controller.signal.aborted) { setError(failure instanceof Error ? failure.message : '问答失败，问题已保留。'); void refreshStatus() }
    } finally { if (request.current === controller) { request.current = null; setBusy(false) } }
  }

  return <Sheet open={open} onOpenChange={onOpenChange} title="钟楼搭档" description="板子与角色问答 · 建议由说书人核对" contentClassName="sheet-content--rules-advisor">
    {concealed ? <p>遮蔽中，请先退出遮蔽再查看问答。</p> : <div className="rules-advisor">
      <div className="rules-advisor__context">
        <Field label="搜索问答板子"><input type="search" value={search} disabled={busy} onChange={event => setSearch(event.target.value)} placeholder="板子名称或英文 ID" /></Field>
        <Field label="问答板子"><select value={scriptId} disabled={busy} onChange={event => { setScriptId(event.target.value); setRoleId('') }}>{choices.map(script => <option key={script.scriptId} value={script.scriptId}>{script.displayName}</option>)}</select></Field>
        <Field label="关注角色"><select value={roleId} disabled={busy || loadingPack || !pack} onChange={event => setRoleId(event.target.value)}><option value="">全板规则与搭配</option>{pack?.roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</select></Field>
        <p className="rules-advisor__note">只发送所选板子、角色资料和最近4轮同主题对话。不读取本局身份、状态或记录。选择板子不会切换对局。</p>
      </div>
      <div ref={conversation} className="rules-advisor__conversation" role="log" aria-label="规则问答对话" aria-relevant="additions" aria-live="polite">
        {!turns.length ? <div className="rules-advisor__welcome"><strong>我是你的钟楼搭档。</strong><p>可以问技能怎么发动、夜序如何衔接，或两个角色碰在一起怎么处理。我会先讲结论，再给依据；资料不足时会追问。</p><p className="rules-advisor__note">例如：这块板的首夜有哪些特别步骤？某角色中毒后要注意什么？</p></div> : turns.map((turn, index) => <article key={index}>
          <p className="rules-advisor__question"><span>你 · {turn.answer.scopeLabel}</span>{turn.question}</p>
          <RulesAdvisorAnswer answer={turn.answer} />
        </article>)}
        {busy ? <p role="status">正在查阅 {scopeLabel} 的已存资料并组织回答…可以先关闭侧窗，回来继续查看。</p> : null}
      </div>
      {status?.state === 'locked' ? <AIAccessSettings runtime={runtime} authorized={false} onChanged={refreshStatus} /> : null}
      {status && status.state !== 'ready' && status.state !== 'locked' ? <p role="status">{status.message}<Button variant="ghost" onClick={() => { void refreshStatus() }}>重新检查</Button></p> : null}
      {error ? <p role="alert">{error}</p> : null}
      <form className="rules-advisor__composer" onSubmit={event => { event.preventDefault(); void send() }}>
        <Field label={`询问 · ${scopeLabel}`}><textarea aria-label="规则问题" rows={3} maxLength={1200} value={question} disabled={busy} onChange={event => setQuestion(event.target.value)} placeholder="描述问题；涉及具体局面时，请补充生死、毒醉和发生时点。" /></Field>
        <div className="rules-advisor__footer"><span className="rules-advisor__note">{loadingPack ? '正在加载板子资料…' : !status ? '正在检查 AI 访问…' : '对话仅留在本页，刷新后清空。每次发送会调用 AI。'}</span><Button type="submit" variant="primary" disabled={busy || loadingPack || !pack || !question.trim() || status?.state !== 'ready'}>{busy ? '回答中' : '发送'}</Button></div>
      </form>
    </div>}
  </Sheet>
}
