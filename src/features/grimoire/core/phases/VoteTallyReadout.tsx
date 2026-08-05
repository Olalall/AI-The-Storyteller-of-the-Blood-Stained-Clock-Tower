/**
 * 白天计票态：核里的「举手 N / 门槛 M / 差 X」。
 *
 * 裁决 10：这三个数只出现在渲染路径。核本身没有 dispatch，所以这条在这个文件里是结构性成立的——
 * 三个数算出来就直接进了 JSX，没有任何一条路径能把它们送进 payload。
 *
 * 同样是裁决 10：达标不自动处决、不自动暂列。所以这里只报数，
 * 不出现「已达标」「可处决」这类把数字翻译成结论的措辞。
 */
import { executionThresholdForAliveCount } from '../../../day-workbench/state/voteRound'
import { CORE_PHASE_LABEL, CORE_UNKNOWN, voteTallyReadout, type GrimoireVoteTally } from '../corePhase'

interface VoteTallyReadoutProps {
  tally: GrimoireVoteTally
  /** 说书人没手改门槛时的兜底来源。 */
  aliveCount: number
}

export function VoteTallyReadout({ tally, aliveCount }: VoteTallyReadoutProps) {
  const threshold = tally.threshold ?? executionThresholdForAliveCount(aliveCount)
  const readout = tally.raised === null ? null : voteTallyReadout(tally.raised, threshold)
  const cells = [
    { key: 'raised', label: '举手', value: readout?.raised ?? null },
    { key: 'vote-threshold', label: '门槛', value: threshold },
    { key: 'gap', label: '差', value: readout?.gap ?? null },
  ]

  return (
    <div className="grimoire-core__tally" role="group" aria-label={CORE_PHASE_LABEL['day-vote']}>
      <dl className="grimoire-core__tally-cells">
        {cells.map((cell) => (
          <div key={cell.key} className="grimoire-core__tally-cell" data-cell={cell.key}>
            <dt className="grimoire-core__tally-label">{cell.label}</dt>
            <dd className="grimoire-core__tally-value" data-empty={cell.value === null}>
              {cell.value === null ? CORE_UNKNOWN : cell.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="grimoire-core__tally-nominee" data-empty={tally.nomineeSeatId == null}>
        {tally.nomineeSeatId == null ? `被提名 ${CORE_UNKNOWN}` : `被提名 ${tally.nomineeSeatId}号`}
      </p>
    </div>
  )
}
