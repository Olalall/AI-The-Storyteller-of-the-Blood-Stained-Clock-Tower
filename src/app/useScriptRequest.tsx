import { useEffect, useRef, useState } from 'react'
import { loadSmartScriptPack, scriptDisplayName } from '../domain/scripts'
import { LoadingFeedback } from './DeferredFeatureFeedback'

export function useScriptRequest(session: object) {
  const currentSession = useRef(session)
  currentSession.current = session
  const version = useRef(0)
  const [request, setRequest] = useState<{ id: string; failed: boolean; returnLabel: string } | null>(null)
  useEffect(() => () => { version.current++ }, [])
  function cancel() { version.current++; setRequest(null) }
  async function run(id: string, onReady: () => void, returnLabel = '返回上一步') {
    const token = ++version.current
    const before = currentSession.current
    setRequest({ id, failed: false, returnLabel })
    try {
      await loadSmartScriptPack(id)
      if (token !== version.current) return
      if (before !== currentSession.current) { setRequest(null); return }
      setRequest(null)
      onReady()
    } catch {
      if (token === version.current) setRequest({ id, failed: true, returnLabel })
    }
  }
  return { run, feedback: request ? <LoadingFeedback open title={`加载剧本：${scriptDisplayName(request.id)}`} failed={request.failed} returnLabel={request.returnLabel} onClose={cancel} /> : null }
}
