/**
 * 黎明：核用大字列出座位号。
 *
 * 只列号码，不列原因、不列角色。黎明播报的护栏是「只报生死，不报原因」，
 * 而核是全场最容易被玩家瞄到的一块——一旦这里出现「被恶魔杀死」，护栏就白立了。
 *
 * 「没录过」与「平安夜」必须长得不一样：前者是工具不知道，后者是说书人确认过。
 * 把两者都渲染成一句「平安夜」，会让漏记变成一条看起来很确定的假事实。
 */
import { CORE_PHASE_LABEL, CORE_UNKNOWN, type GrimoireDawnRoll } from '../corePhase'

interface DawnRollCallProps {
  roll: GrimoireDawnRoll
}

export function DawnRollCall({ roll }: DawnRollCallProps) {
  const { deaths, revivals = [] } = roll

  return (
    <div className="grimoire-core__dawn" role="group" aria-label={CORE_PHASE_LABEL.dawn}>
      <p className="grimoire-core__dawn-label">昨夜死亡</p>
      {deaths === null ? (
        <p className="grimoire-core__dawn-note" data-empty="true">
          {CORE_UNKNOWN}
          <span className="ui-visually-hidden">昨夜生死尚未录入</span>
        </p>
      ) : deaths.length === 0 ? (
        <p className="grimoire-core__dawn-note" data-empty="false">平安夜</p>
      ) : (
        <ol className="grimoire-core__dawn-seats">
          {deaths.map((seatId) => (
            <li key={seatId} className="grimoire-core__dawn-seat">
              {seatId}
              <span className="ui-visually-hidden">号</span>
            </li>
          ))}
        </ol>
      )}
      {revivals.length > 0 ? (
        // 复活是罕见但存在的路径（如「重生」类效果），有就报，没有就整行不出现。
        <p className="grimoire-core__dawn-revived">复活 {revivals.join('、')}号</p>
      ) : null}
    </div>
  )
}
