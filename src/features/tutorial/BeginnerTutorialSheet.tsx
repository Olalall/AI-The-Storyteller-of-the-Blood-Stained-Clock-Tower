import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import dashboardScreenshot from '../../assets/tutorial/01-dashboard.png'
import setupScreenshot from '../../assets/tutorial/02-setup.png'
import identityScreenshot from '../../assets/tutorial/03-identity.png'
import nightScreenshot from '../../assets/tutorial/04-night.png'
import dayScreenshot from '../../assets/tutorial/05-day.png'
import reviewScreenshot from '../../assets/tutorial/06-review.png'
import './tutorial.css'

interface BeginnerTutorialSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: ReactNode
}

interface TutorialFocus {
  label: number
  title: string
  x: number
  y: number
  width: number
  height: number
}

interface TutorialAction {
  label: number
  title: string
  text: string
}

interface TutorialStep {
  title: string
  outcome: string
  image: string
  focuses: readonly TutorialFocus[]
  actions: readonly TutorialAction[]
}

const steps: readonly TutorialStep[] = [
  {
    title: '准备本局', outcome: '进入角色组合页', image: dashboardScreenshot,
    focuses: [
      { label: 1, title: '切换板子', x: 79, y: 20, width: 18, height: 8 },
      { label: 2, title: '智能配板', x: 21, y: 20, width: 19, height: 8 },
    ],
    actions: [
      { label: 1, title: '先确认板子', text: '需要换剧本时点击“切换板子”；不换可直接进入下一项。' },
      { label: 2, title: '打开智能配板', text: '选择 7–15 人和玩家信息，然后点击“开始配板”。' },
    ],
  },
  {
    title: '确认角色组合', outcome: '座位和角色写入本局', image: setupScreenshot,
    focuses: [
      { label: 1, title: '候选组合', x: 2, y: 22, width: 32, height: 44 },
      { label: 2, title: '选择组合', x: 17, y: 59, width: 47, height: 8 },
      { label: 3, title: '座位草稿', x: 2, y: 78, width: 96, height: 20 },
    ],
    actions: [
      { label: 1, title: '比较候选', text: '先看三套组合的角色和建议；AI 结果此时仍只是候选。' },
      { label: 2, title: '选择一套', text: '点击“选择组合”，需要时再调整角色或座位。' },
      { label: 3, title: '确认配板', text: '核对人数与座位后，由说书人确认配板。' },
    ],
  },
  {
    title: '依次发送身份', outcome: '所有玩家已领取身份', image: identityScreenshot,
    focuses: [
      { label: 1, title: '领取进度', x: 3, y: 14, width: 94, height: 24 },
      { label: 2, title: '选择玩家', x: 3, y: 40, width: 59, height: 53 },
      { label: 3, title: '单人展示', x: 65, y: 40, width: 32, height: 53 },
    ],
    actions: [
      { label: 1, title: '选择领取方式', text: '屏幕领取适合逐人查看；实体抽牌可直接登记结果。' },
      { label: 2, title: '点当前玩家', text: '按座位顺序选择玩家，避免漏发或重复展示。' },
      { label: 3, title: '只给本人查看', text: '打开单人展示，查看后先收回设备，再交给下一位。' },
    ],
  },
  {
    title: '处理夜晚', outcome: '本夜角色全部确认', image: nightScreenshot,
    focuses: [
      { label: 1, title: '夜序进度', x: 37, y: 1, width: 30, height: 12 },
      { label: 2, title: '当前角色', x: 52, y: 17, width: 16, height: 28 },
      { label: 3, title: '本项记录', x: 50, y: 46, width: 48, height: 52 },
    ],
    actions: [
      { label: 1, title: '按夜序推进', text: '顶部显示已确认数量；不要跳过仍需处理的角色。' },
      { label: 2, title: '确认当前角色', text: '先看中央角色与座位，再读取左侧能力说明。' },
      { label: 3, title: '记录并确认', text: '选择目标、填写结果；涉及状态变化时必须由说书人确认。' },
    ],
  },
  {
    title: '记录白天与投票', outcome: '投票或处决结果写入本局', image: dayScreenshot,
    focuses: [
      { label: 1, title: '选择提名', x: 19, y: 20, width: 34, height: 45 },
      { label: 2, title: '记录举手', x: 54, y: 20, width: 44, height: 37 },
      { label: 3, title: '确认票型', x: 56, y: 57, width: 41, height: 7 },
    ],
    actions: [
      { label: 1, title: '选择提名双方', text: '先点提名人，再点被提名人，核对顶部摘要。' },
      { label: 2, title: '记录举手', text: '逐个点选举手玩家，系统同时显示票数、死票和门槛。' },
      { label: 3, title: '确认记录', text: '达到门槛只会生成候选；处决仍由说书人确认。' },
    ],
  },
  {
    title: '保存并查看复盘', outcome: '本局可安全重置并随时复盘', image: reviewScreenshot,
    focuses: [
      { label: 1, title: '重置与复盘', x: 5, y: 15, width: 31, height: 7 },
      { label: 2, title: '历史对局', x: 5, y: 36, width: 31, height: 14 },
      { label: 3, title: '对局详情', x: 40, y: 27, width: 51, height: 71 },
    ],
    actions: [
      { label: 1, title: '先保存再重置', text: '回到首页点“重置游戏”，声明胜方并保存本局后才能清空。' },
      { label: 2, title: '选择历史对局', text: '切到“历史复盘”，按日期选择要查看的对局。' },
      { label: 3, title: '核对记录', text: '查看胜方、夜晚、白天、投票和更正记录，需要时导出备份。' },
    ],
  },
]

function focusStyle(focus: TutorialFocus): CSSProperties {
  return { left: `${focus.x}%`, top: `${focus.y}%`, width: `${focus.width}%`, height: `${focus.height}%` }
}

export function BeginnerTutorialSheet({ open, onOpenChange, trigger }: BeginnerTutorialSheetProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const step = steps[stepIndex]

  useEffect(() => {
    if (open) setStepIndex(0)
  }, [open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange} trigger={trigger} title="新手教程" description={`第 ${stepIndex + 1} 步，共 ${steps.length} 步`} contentClassName="sheet-content--tutorial">
      <div className="beginner-tutorial">
        <div className="beginner-tutorial__intro">
          <strong>跟着编号操作</strong>
          <p>金色框是当前要找的位置。完成本页目标后，再进入下一步。</p>
        </div>

        <ol className="beginner-tutorial__flow" aria-label="一局流程">
          {steps.map((item, index) => <li key={item.title}>
            <button type="button" className={index === stepIndex ? 'is-current' : ''} aria-current={index === stepIndex ? 'step' : undefined} onClick={() => setStepIndex(index)}>
              <span>{index + 1}</span>{item.title}
            </button>
          </li>)}
        </ol>

        <article className="beginner-tutorial__step">
          <header>
            <span>{stepIndex + 1}</span>
            <div><h3>{step.title}</h3><p>完成后：{step.outcome}</p></div>
          </header>
          <figure className="beginner-tutorial__figure">
            <img src={step.image} alt={`${step.title}界面`} />
            {step.focuses.map((focus) => <span aria-hidden="true" className="beginner-tutorial__focus-box" key={focus.label} style={focusStyle(focus)}><b>{focus.label}</b></span>)}
            <a href={step.image} target="_blank" rel="noreferrer" aria-label={`打开${step.title}大图`}><ExternalLink aria-hidden="true" />查看大图</a>
          </figure>
          <ol className="beginner-tutorial__actions">
            {step.actions.map((action) => <li key={action.label}>
              <span>{action.label}</span>
              <p><strong>{action.title}</strong>{action.text}</p>
            </li>)}
          </ol>
        </article>

        <footer className="beginner-tutorial__footer">
          <Button variant="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>上一步</Button>
          <span>{stepIndex + 1} / {steps.length}</span>
          {stepIndex === steps.length - 1
            ? <Button variant="primary" onClick={() => onOpenChange(false)}>完成教程</Button>
            : <Button variant="primary" onClick={() => setStepIndex((current) => Math.min(steps.length - 1, current + 1))}>下一步</Button>}
        </footer>
      </div>
    </Sheet>
  )
}
