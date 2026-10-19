import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'
import { loadSmartScriptPack } from '../domain/scripts'
import { gameSessionStorageKey } from '../services/session'
import './deferred-feature.css'

function storedSession() {
  try { return localStorage.getItem(gameSessionStorageKey) } catch { return null }
}
function scriptIdFrom(raw: string | null) {
  try {
    const value = JSON.parse(raw ?? 'null')
    return typeof value?.scriptId === 'string' ? value.scriptId : 'catfishing'
  } catch { return 'catfishing' }
}
async function prepareStoredScript() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const raw = storedSession()
    await loadSmartScriptPack(scriptIdFrom(raw))
    if (storedSession() === raw) return
  }
  throw new Error('对局正在其他页面变化，请稍后重新打开。')
}
function exportStoredSession() {
  const raw = storedSession()
  if (!raw) return
  const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url; link.download = 'botc-session-backup.json'
  document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url)
}
/** Do not mount the session hook (or acquire/save) until its knowledge is ready. */
export function SessionBootstrap({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading')
  useEffect(() => {
    let active = true
    prepareStoredScript().then(() => { if (active) setState('ready') }, () => { if (active) setState('failed') })
    return () => { active = false }
  }, [])
  if (state === 'ready') return children
  return <Sheet open onOpenChange={() => undefined} dismissible={false} title="加载本局剧本" description={state === 'failed' ? '资料加载失败，尚未打开或改写对局。请检查网络及当前版本是否包含该剧本。' : '正在准备本局资料。'}>
    <div className="deferred-feature-feedback" role={state === 'failed' ? 'alert' : 'status'}>
      {state === 'failed' ? <><Button onClick={() => window.location.reload()}>重新加载页面</Button><Button onClick={exportStoredSession}>导出已有存档</Button></> : <p>请稍候</p>}
    </div>
  </Sheet>
}
