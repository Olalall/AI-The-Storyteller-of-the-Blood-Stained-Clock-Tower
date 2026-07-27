import { AlertTriangle, Check, ListMusic, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { RoleDisc } from '../../components/ui/RoleDisc'
import { SeatButton } from '../../components/ui/SeatButton'
import { Sheet } from '../../components/ui/Sheet'
import { StatusBadge, type BadgeTone } from '../../components/ui/StatusBadge'
import './ui-lab.css'

const colorTokens: Array<[string, string, BadgeTone]> = [
  ['当前焦点', 'var(--accent)', 'current'],
  ['信息提示', 'var(--info-text)', 'info'],
  ['已确认', 'var(--success-text)', 'success'],
  ['待核对', 'var(--warning-text)', 'warning'],
  ['危险/中毒', 'var(--danger-text)', 'danger'],
]

export function UiLab() {
  const [selectedSeat, setSelectedSeat] = useState(4)
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <main className="ui-lab">
      <header className="ui-lab__hero">
        <span>UI FOUNDATION · V0.1</span>
        <h1>先统一手感，再扩展页面</h1>
        <p>这不是完整组件库。这里只固定夜间高频控件、状态和低亮度触控规则，业务组件经过真实页面验证后再抽取。</p>
      </header>

      <section className="ui-lab__section">
        <header><div><span>01</span><h2>语义颜色与状态</h2></div><p>颜色不是唯一信号，所有状态都带文字。</p></header>
        <div className="token-grid">
          {colorTokens.map(([label, color, tone]) => (
            <div className="token-card" key={label}>
              <i style={{ background: color }} />
              <strong>{label}</strong>
              <StatusBadge tone={tone}>{label}</StatusBadge>
            </div>
          ))}
        </div>
      </section>

      <section className="ui-lab__section">
        <header><div><span>02</span><h2>动作层级</h2></div><p>一个阶段只允许一个主按钮。</p></header>
        <div className="component-row">
          <Button variant="primary"><Check aria-hidden="true" />确认本项</Button>
          <Button variant="secondary">仅保存</Button>
          <Button variant="ghost"><Sparkles aria-hidden="true" />辅助判断</Button>
          <Button variant="danger"><AlertTriangle aria-hidden="true" />放弃草稿</Button>
          <Button variant="primary" disabled>缺少最终结果</Button>
        </div>
      </section>

      <section className="ui-lab__section">
        <header><div><span>03</span><h2>角色 Token</h2></div><p>官方角色图标居中，圆形 Token 只负责识别与聚焦。</p></header>
        <div className="disc-row">
          <div><RoleDisc initial="脑" roleName="洗脑师" imageSrc="/assets/characters/cerenovus.webp" size="large" active /><strong>正在处理</strong></div>
          <div><RoleDisc initial="巫" roleName="麻脸巫婆" imageSrc="/assets/characters/pithag.webp" /><strong>普通预览</strong></div>
          <div><RoleDisc initial="隐" roleName="已遮蔽" concealed /><strong>遮蔽状态</strong></div>
        </div>
      </section>

      <section className="ui-lab__section">
        <header><div><span>04</span><h2>座位号码卡</h2></div><p>数字清晰、触控≥44px；选中同时显示勾选、描边和颜色。</p></header>
        <div className="component-row">
          {Array.from({ length: 12 }, (_, index) => index + 1).map((seat) => (
            <SeatButton key={seat} seat={seat} selected={selectedSeat === seat} onClick={() => setSelectedSeat(seat)} />
          ))}
        </div>
      </section>

      <section className="ui-lab__section">
        <header><div><span>05</span><h2>独立展开夜序</h2></div><p>夜间顺序不常驻主界面，只有一个Sheet实例。</p></header>
        <Sheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          title="组件示例 Sheet"
          description="实际页面中这里展示本夜顺序。"
          trigger={<Button variant="secondary"><ListMusic aria-hidden="true" />打开夜间顺序</Button>}
        >
          <div className="ui-lab__sheet-demo">
            <RoleDisc initial="脑" roleName="洗脑师" imageSrc="/assets/characters/cerenovus.webp" />
            <div><StatusBadge tone="current">正在处理</StatusBadge><h3>10号 · 洗脑师</h3><p>点击列表项只预览，不改变夜间光标。</p></div>
          </div>
        </Sheet>
      </section>
    </main>
  )
}
