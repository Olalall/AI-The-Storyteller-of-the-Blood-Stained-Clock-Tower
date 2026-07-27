import { useEffect, useReducer, type Dispatch } from 'react'
import { gameSessionReducer, type GameSessionAction } from './sessionReducer'
import { loadGameSession, persistGameSession } from '../../../services/session'

/** 仅在 App 层创建一次；工作台只接收同一个 session 与 dispatch。 */
export function useGameSession() {
  const [session, dispatch] = useReducer(gameSessionReducer, undefined, loadGameSession)

  useEffect(() => {
    persistGameSession(session)
  }, [session])

  return { session, dispatch: dispatch as Dispatch<GameSessionAction> }
}
