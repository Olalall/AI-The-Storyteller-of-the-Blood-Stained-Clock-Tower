import { Button } from '../../../components/ui/Button'
import { pendingPoppyRecognition } from '../../game-session/state/poppyRecognition'
import { nightContextKey, type NightWorkbenchSessionBinding } from '../state/gameSessionAdapter'

export function PoppyRecognitionHandoff({ binding }: { binding: NightWorkbenchSessionBinding }) {
  const pending = pendingPoppyRecognition(binding.session)
  if (!pending) return null
  return <aside className="night-disclosure" aria-label="罂粟死亡后的相认">
    <strong>{pending.seatId}号罂粟种植者已死亡</strong>
    {pending.impairedAtDeath ? <p>死亡时已记录毒醉：默认不会触发相认。若本桌采用可选规则，请人工核对并留记录。</p>
      : <><p>本夜需要相认。名单会包含有效魔术师，不重复发伪装；已有记录保留。</p>
        <Button variant="secondary" onClick={() => binding.dispatchSession({ type: 'apply-poppy-recognition', expectedContextKey: nightContextKey(binding.session) })}>补入相认步骤</Button></>}
  </aside>
}
