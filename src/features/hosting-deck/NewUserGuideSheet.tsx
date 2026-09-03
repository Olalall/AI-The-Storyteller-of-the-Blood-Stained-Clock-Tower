import { BookOpenCheck, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, Sparkles, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import dashboardScreenshot from '../../assets/tutorial/01-dashboard.png'
import setupScreenshot from '../../assets/tutorial/02-setup.png'
import identityScreenshot from '../../assets/tutorial/03-identity.png'
import nightScreenshot from '../../assets/tutorial/04-night.png'
import dayScreenshot from '../../assets/tutorial/05-day.png'
import reviewScreenshot from '../../assets/tutorial/06-review.png'
import './new-user-guide.css'

type TutorialFocus = {
  label: number
  title: string
  x: number
  y: number
  width: number
  height: number
}

type GuideStep = {
  phase: string
  title: string
  summary: string
  image: string
  focuses: readonly TutorialFocus[]
  actions: readonly string[]
  done: string
  caution: string
  nextLabel: string
}

const GUIDE_STEPS: readonly GuideStep[] = [
  {
    phase: '开始前',
    title: '先选择主持方式',
    summary: '有实体魔典就用工具做记录；没有实体魔典就让屏幕同时显示座位与状态。手机显示列表，平板或横屏会显示座位环。',
    image: dashboardScreenshot,
    focuses: [
      { label: 1, title: '切换板子', x: 79, y: 20, width: 18, height: 8 },
      { label: 2, title: '智能配板', x: 21, y: 20, width: 19, height: 8 },
    ],
    actions: ['选择“桌上有实体魔典”或“没有实体魔典”。', '点击“继续：选择板子和人数”。'],
    done: '进入“设置本局”页面。',
    caution: '这一步只改变界面，不会创建角色、发送身份或开始夜晚。',
    nextLabel: '下一步：生成配板',
  },
  {
    phase: '开局配板',
    title: '生成并确认配板',
    summary: '先选板子和人数。昵称与经验是可选项，不填写也能开局。',
    image: setupScreenshot,
    focuses: [
      { label: 1, title: '候选组合', x: 2, y: 22, width: 32, height: 44 },
      { label: 2, title: '选择组合', x: 17, y: 59, width: 47, height: 8 },
      { label: 3, title: '座位草稿', x: 2, y: 78, width: 96, height: 20 },
    ],
    actions: ['点击“生成配板方案”。', '选择一套方案；它此时仍只是草稿。', '核对角色、座位和恶魔伪装，最后点击“确认配板”。'],
    done: '页面进入“准备首夜”，顶部出现本局阶段轨道。',
    caution: 'AI 只能排序、解释或生成候选。没有点击“确认配板”前，任何方案都没有正式生效。',
    nextLabel: '下一步：发送身份',
  },
  {
    phase: '身份交接',
    title: '让每名玩家收到身份',
    summary: '点击顶部“本局”打开总控页；身份未领取时，主任务会直接显示“去发身份”。',
    image: identityScreenshot,
    focuses: [
      { label: 1, title: '领取进度', x: 3, y: 14, width: 94, height: 24 },
      { label: 2, title: '选择玩家', x: 3, y: 40, width: 59, height: 53 },
      { label: 3, title: '单人展示', x: 65, y: 40, width: 32, height: 53 },
    ],
    actions: ['屏幕领取：选择座位，打开单人展示，交给本人“显示身份”，领取后返回遮蔽。', '实体抽牌：玩家拿牌后，逐个点击“标记已领取”。', '确认所有玩家都已领取，再回到主持台。'],
    done: '身份领取数量达到全员，且角色仍只对说书人和本人可见。',
    caution: '不要把完整魔典投屏给玩家；共享设备交接前先确认已经回到遮蔽状态。',
    nextLabel: '下一步：处理夜晚',
  },
  {
    phase: '夜间主持',
    title: '按夜序逐项确认',
    summary: '在“准备首夜”点击开始。工作台会显示当前角色、目标输入、技能说明和结果候选。',
    image: nightScreenshot,
    focuses: [
      { label: 1, title: '夜序进度', x: 37, y: 1, width: 30, height: 12 },
      { label: 2, title: '当前角色', x: 52, y: 17, width: 16, height: 28 },
      { label: 3, title: '本项记录', x: 50, y: 46, width: 48, height: 52 },
    ],
    actions: ['按现场情况选择玩家、角色或结果。', '需要时查看 AI 建议，但先由你核对规则和当前局面。', '点击“确认并下一位”；需要留在当前项时用“确认并停留”。', '全部处理后点击“准备结束本夜”，再确认结束。'],
    done: '进入黎明交接页，可以宣布本夜生死变化。',
    caution: '夜间结果、死亡、毒醉和身份变化都不会因为 AI 建议自动写入。',
    nextLabel: '下一步：记录白天',
  },
  {
    phase: '白天主持',
    title: '记录提名、票型和处决',
    summary: '宣布睁眼后进入白天。先记录公开技能和事件，再按提名顺序记录投票。',
    image: dayScreenshot,
    focuses: [
      { label: 1, title: '选择提名', x: 19, y: 20, width: 34, height: 45 },
      { label: 2, title: '记录举手', x: 54, y: 20, width: 44, height: 37 },
      { label: 3, title: '确认票型', x: 56, y: 57, width: 41, height: 7 },
    ],
    actions: ['选择提名人与被提名人，点击“下一步：记录举手”。', '点选举手玩家；死亡玩家使用死亡票时要额外标记。', '点击“记录本轮票型”，系统只保存票型，不会自动处决。', '选择“记录处决X号”或“记录无处决”，点击“确认记录”，再准备结束白天。'],
    done: '白天记录关闭，可以准备下一夜。',
    caution: '达到票数门槛只会产生暂列结果；处决和玩家死亡仍要由说书人确认。',
    nextLabel: '下一步：结束复盘',
  },
  {
    phase: '结束与备份',
    title: '保存本局，再复盘或重开',
    summary: '点击顶部“更多 → 收尾与复盘”进入结束页。先保存本局，重要对局再导出备份。',
    image: reviewScreenshot,
    focuses: [
      { label: 1, title: '重置与复盘', x: 5, y: 15, width: 31, height: 7 },
      { label: 2, title: '历史对局', x: 5, y: 36, width: 31, height: 14 },
      { label: 3, title: '对局详情', x: 40, y: 27, width: 51, height: 71 },
    ],
    actions: ['选择获胜阵营或结果未定，点击“保存本局”生成历史归档。', '需要换设备或长期保存时点击“导出备份”。', '进入“历史复盘”查看时间线和 AI 复盘草稿。', '只有确认归档完成后，再勾选确认并重置游戏。'],
    done: '本局出现在历史复盘中，新局可以从空白开局页重新开始。',
    caution: '浏览器本机数据可能被清理；重要对局应主动导出。真实 AI 和云端归档需要联网。',
    nextLabel: '完成教学',
  },
]

interface NewUserGuideSheetProps {
  className?: string
  triggerLabel?: string
  onLoadDemo?: () => void
  demoAvailable?: boolean
  layer?: 'default' | 'nested'
}

export function NewUserGuideSheet({ className = '', triggerLabel = '新手教学', onLoadDemo, demoAvailable = false, layer = 'default' }: NewUserGuideSheetProps) {
  const [open, setOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const step = GUIDE_STEPS[stepIndex]
  const isLastStep = stepIndex === GUIDE_STEPS.length - 1

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) setStepIndex(0)
  }

  function nextStep() {
    if (isLastStep) {
      changeOpen(false)
      return
    }
    setStepIndex((current) => current + 1)
  }

function loadDemo() {
    if (!onLoadDemo || !demoAvailable) return
    changeOpen(false)
    onLoadDemo()
  }

  function focusStyle(focus: TutorialFocus) {
    return { left: `${focus.x}%`, top: `${focus.y}%`, width: `${focus.width}%`, height: `${focus.height}%` }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={changeOpen}
      title="新手教学"
      description={`第 ${stepIndex + 1} / ${GUIDE_STEPS.length} 步 · ${step.phase}`}
      contentClassName="sheet-content--new-user-guide"
      layer={layer}
      trigger={<Button type="button" variant="ghost" compact className={className}><BookOpenCheck aria-hidden="true" />{triggerLabel}</Button>}
    >
      <article className="new-user-guide" aria-labelledby="new-user-guide-step-title">
        <div className="new-user-guide__progress" aria-label={`教学进度：第 ${stepIndex + 1} 步，共 ${GUIDE_STEPS.length} 步`}>
          <span>{step.phase}</span>
          <ol aria-hidden="true">{GUIDE_STEPS.map((item, index) => <li key={item.title} className={index <= stepIndex ? 'is-reached' : ''} />)}</ol>
        </div>

        <header className="new-user-guide__hero">
          <span>现在要做什么</span>
          <h3 id="new-user-guide-step-title">{step.title}</h3>
          <p>{step.summary}</p>
        </header>

        <figure className="new-user-guide__figure">
          <img src={step.image} alt={`${step.title}界面`} />
          {step.focuses.map((focus) => <span aria-hidden="true" className="new-user-guide__focus-box" key={focus.label} style={focusStyle(focus)}><b>{focus.label}</b></span>)}
          <a href={step.image} target="_blank" rel="noreferrer" aria-label={`打开${step.title}大图`}><ExternalLink aria-hidden="true" />查看大图</a>
        </figure>

        <section className="new-user-guide__instructions" aria-labelledby="new-user-guide-actions-title">
          <h4 id="new-user-guide-actions-title">照着这样做</h4>
          <ol>{step.actions.map((action) => <li key={action}>{action}</li>)}</ol>
        </section>

        <div className="new-user-guide__done">
          <CheckCircle2 aria-hidden="true" />
          <span><small>本步完成标志</small><strong>{step.done}</strong></span>
        </div>

        <aside className="new-user-guide__caution">
          <TriangleAlert aria-hidden="true" />
          <span><small>别误操作</small><strong>{step.caution}</strong></span>
        </aside>

        {isLastStep && onLoadDemo ? <section className="new-user-guide__demo" aria-label="示例对局">
          <div><Sparkles aria-hidden="true" /><span><strong>想先练一遍？</strong><small>示例局会直接进入一局已经进行到第 3 夜的瓦釜雷鸣。</small></span></div>
          <Button type="button" variant="secondary" disabled={!demoAvailable} onClick={loadDemo}>载入示例对局</Button>
          {!demoAvailable ? <p>先完成教学并选择主持方式，再重新打开教学载入示例。</p> : null}
        </section> : null}

        <footer className="new-user-guide__actions">
          <Button type="button" variant="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex((current) => current - 1)}><ChevronLeft aria-hidden="true" />上一步</Button>
          <Button type="button" variant="primary" onClick={nextStep}>{step.nextLabel}{!isLastStep ? <ChevronRight aria-hidden="true" /> : null}</Button>
        </footer>
      </article>
    </Sheet>
  )
}
