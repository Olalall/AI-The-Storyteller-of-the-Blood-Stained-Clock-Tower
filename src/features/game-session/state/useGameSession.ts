import { useLayoutEffect, useReducer, useRef, type Dispatch } from 'react'
import { gameSessionReducer, type GameSessionAction } from './sessionReducer'
import { loadGameSession, persistGameSession } from '../../../services/session'

/**
 * 仅在 App 层创建一次；工作台只接收同一个 session 与 dispatch。
 *
 * 只读标签页不能写 localStorage。若它后来接管了已经失效的锁，必须先重读
 * 原所有者最后落盘的版本，不能拿自己打开时那份旧内存反向覆盖。
 */
export function useGameSession(writable = true) {
  const [session, dispatch] = useReducer(gameSessionReducer, undefined, loadGameSession)
  const wasWritable = useRef(writable)

  useLayoutEffect(() => {
    if (!writable) {
      wasWritable.current = false
      return
    }
    if (!wasWritable.current) {
      wasWritable.current = true
      dispatch({ type: 'replace-session', session: loadGameSession() })
      return
    }
    persistGameSession(session)
  }, [session, writable])

  return { session, dispatch: dispatch as Dispatch<GameSessionAction> }
}
