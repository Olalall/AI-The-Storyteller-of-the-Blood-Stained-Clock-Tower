import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Sheet } from '../../../components/ui/Sheet'
import { projectKazaliAllocation } from '../../game-session/state/applyKazaliAllocation'
import { nightContextKey, type NightWorkbenchSessionBinding } from '../state/gameSessionAdapter'

export function KazaliAllocationHandoff({ binding }: { binding: NightWorkbenchSessionBinding }) {
  const [open, setOpen] = useState(false)
  const plan = projectKazaliAllocation(binding.session)
  if (!plan?.record || plan.run.privacyShielded) return null
  if (plan.isApplied) return <p>卡扎力首夜分配已应用 · 新爪牙按当夜夜序处理，原角色未发动项已停用。</p>
  return <div className="kazali-allocation-handoff">
    <strong>首夜分配已记录，尚未应用身份和当夜夜序。</strong>
    {plan.blockedReason ? <p role="status">{plan.blockedReason}</p> : null}
    <Sheet open={open} onOpenChange={setOpen} title="应用卡扎力首夜分配" description="核对现场后明确确认；将追加身份变更并更新本夜夜序，已确认记录和旧草稿保留。" trigger={<Button variant="primary" disabled={Boolean(plan.blockedReason)}>核对并应用首夜分配</Button>}>
      <div className="night-close-checklist">
        <ul aria-label="首夜身份变更预览">{plan.changes.map((change) => <li key={change.seatId}><strong>{change.seatId}号：{change.fromRole.name} → {change.toRole.name}</strong></li>)}</ul>
        <p>新爪牙会加入本夜对应顺位；被替换角色尚未发动的项目停用。已确认的项目保留，请核对是否需要追加更正。</p>
        {plan.pairs.some((pair) => pair.roleId === 'marionette') ? <p>提线木偶保留原善良对外身份，在对应顺位加入假装行动提醒；原善良技能不生效，不向该玩家展示爪牙身份或完整分配表。</p> : null}
        <p>毒醉和原能力的持续效果仍请核对来源后单独调整。</p>
        {plan.pairs.some((pair) => pair.seatId === plan.item.seatId) ? <p>本次包含卡扎力本人，请特别核对现场身份和胜负；本工具不自动判定游戏结束。</p> : null}
        <p>男爵、教父等开局人数调整不会再次自动执行；召唤师等后续技能仍需按实际轮次单独确认。</p>
        <Button variant="primary" disabled={Boolean(plan.blockedReason)} onClick={() => {
          binding.dispatchSession({ type: 'apply-kazali-allocation', nightRunId: plan.run.id, sourceEntryId: plan.record!.id, expectedContextKey: nightContextKey(binding.session), confirmedAt: new Date().toISOString() })
          setOpen(false)
        }}>确认应用身份并更新本夜夜序</Button>
      </div>
    </Sheet>
  </div>
}
