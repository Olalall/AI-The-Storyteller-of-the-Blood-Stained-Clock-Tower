import { BookOpenText, Maximize2, Pencil, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import {
  defaultOpeningScript,
  readOpeningScript,
  restoreDefaultOpeningScript,
  saveOpeningScript,
} from '../../services/opening-script'
import './opening-script.css'

interface OpeningScriptSheetProps {
  sessionId: string
}

const hostMaterials = [
  {
    id: 'opening',
    label: '开场白',
    title: '开场欢迎',
    summary: '开局前直接照读',
    content: defaultOpeningScript,
  },
  {
    id: 'background',
    label: '世界背景',
    title: '钟楼镇发生了什么',
    summary: '帮助玩家快速入戏',
    content: [
      '昨夜，钟楼镇的说书人被恶魔杀害。恶魔仍藏在人群之中，它的爪牙也在暗处协助。',
      '善良阵营需要通过能力、发言和投票找出恶魔；邪恶阵营则要隐藏身份并误导大家。',
      '信息可能受到醉酒、中毒或角色能力影响。你听到的内容不一定完整，但都是本局推理的一部分。',
    ].join('\n'),
  },
  {
    id: 'beginner',
    label: '新手须知',
    title: '第一次玩先记住这些',
    summary: '减少规则解释时间',
    content: [
      '先说你知道什么，再说你怀疑什么；不知道完整规则也可以正常参与。',
      '夜晚闭眼并保持安静，只在说书人示意时睁眼或行动。',
      '白天可以私聊、公开讨论、提名和投票。死亡后仍可发言，但通常只剩一张幽灵票。',
      '不确定技能或流程时，随时私下询问说书人。',
    ].join('\n'),
  },
  {
    id: 'table-rules',
    label: '桌规声明',
    title: '本桌共同遵守',
    summary: '开局前统一边界',
    content: [
      '不公开展示身份牌、手机画面或说书人私发的信息来证明身份。',
      '不以发誓、赌咒、现实关系、场外承诺或离席行为作为身份保证。',
      '不翻看他人设备，不截取私聊，不用本局之外的信息干扰判断。',
      '允许扮演、欺骗和强烈辩论，但不进行人身攻击；让每位玩家都有完整发言机会。',
      '规则争议先交给说书人裁定，复盘时再讨论细节。',
    ].join('\n'),
  },
  {
    id: 'features',
    label: '游戏特色',
    title: '这局为什么值得玩',
    summary: '说明体验预期',
    content: [
      '这是一场信息不完全的团队推理游戏。能力提供线索，交流决定线索如何被理解。',
      '死亡不会立刻退出游戏；你仍能发言、影响判断，并在关键时刻使用幽灵票。',
      '说书人负责维持规则与戏剧性，但不会替任何阵营做决定。最终胜负来自玩家的选择。',
    ].join('\n'),
  },
] as const

type HostMaterialId = typeof hostMaterials[number]['id']

export function OpeningScriptSheet({ sessionId }: OpeningScriptSheetProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState(() => readOpeningScript(sessionId))
  const [draft, setDraft] = useState(content)
  const [editing, setEditing] = useState(false)
  const [displaying, setDisplaying] = useState(false)
  const [selectedMaterialId, setSelectedMaterialId] = useState<HostMaterialId>('opening')
  const selectedMaterial = hostMaterials.find((item) => item.id === selectedMaterialId) ?? hostMaterials[0]
  const selectedContent = selectedMaterialId === 'opening' ? content : selectedMaterial.content

  useEffect(() => {
    const next = readOpeningScript(sessionId)
    setContent(next)
    setDraft(next)
    setEditing(false)
    setDisplaying(false)
    setSelectedMaterialId('opening')
  }, [sessionId])

  function closeOrOpen(nextOpen: boolean) {
    if (!nextOpen) {
      setDraft(content)
      setEditing(false)
      setDisplaying(false)
    }
    setOpen(nextOpen)
  }

  function startEditing() {
    setDraft(content)
    setEditing(true)
  }

  function saveDraft() {
    const next = draft.trim()
    if (!next) return
    saveOpeningScript(sessionId, next)
    setContent(next)
    setDraft(next)
    setEditing(false)
  }

  function restoreDefault() {
    const next = restoreDefaultOpeningScript(sessionId)
    setContent(next)
    setDraft(next)
    setEditing(false)
  }

  function selectMaterial(materialId: HostMaterialId) {
    setSelectedMaterialId(materialId)
    setEditing(false)
    setDisplaying(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={closeOrOpen}
      title="主持资料"
      description="开局时快速查看或向全桌展示；不会写入本局。"
      presentation="page"
      trigger={<Button variant="secondary" compact><BookOpenText aria-hidden="true" />主持资料</Button>}
    >
      <div className="opening-script">
        {!displaying ? <nav className="opening-script__tabs" aria-label="主持资料分类">
          {hostMaterials.map((material) => <button
            type="button"
            key={material.id}
            className={material.id === selectedMaterialId ? 'is-active' : ''}
            aria-current={material.id === selectedMaterialId ? 'page' : undefined}
            onClick={() => selectMaterial(material.id)}
          >
            <strong>{material.label}</strong>
            <small>{material.summary}</small>
          </button>)}
        </nav> : null}

        {displaying ? <section className="opening-script__display" aria-label={`${selectedMaterial.label}大字展示`}>
          <span>{selectedMaterial.label}</span>
          <p>{selectedContent}</p>
          <Button variant="secondary" onClick={() => setDisplaying(false)}>退出展示</Button>
        </section> : editing ? <section className="opening-script__editor" aria-label="编辑开场白">
          <label>开场白文案
            <textarea aria-label="开场白文案" value={draft} maxLength={1600} onChange={(event) => setDraft(event.target.value)} />
          </label>
          <div className="opening-script__actions">
            <Button variant="ghost" onClick={() => { setDraft(content); setEditing(false) }}>取消编辑</Button>
            <Button variant="secondary" onClick={restoreDefault}><RotateCcw aria-hidden="true" />恢复默认</Button>
            <Button variant="primary" disabled={!draft.trim()} onClick={saveDraft}>保存文案</Button>
          </div>
        </section> : <section className="opening-script__preview" aria-label={`${selectedMaterial.label}预览`}>
          <div className="opening-script__heading">
            <span>{selectedMaterial.label}</span>
            <h3>{selectedMaterial.title}</h3>
          </div>
          <p>{selectedContent}</p>
          <div className="opening-script__actions">
            {selectedMaterialId === 'opening' ? <Button variant="secondary" onClick={startEditing}><Pencil aria-hidden="true" />编辑文案</Button> : null}
            <Button variant="primary" onClick={() => setDisplaying(true)}><Maximize2 aria-hidden="true" />大字展示</Button>
          </div>
          {selectedMaterialId === 'opening' && content !== defaultOpeningScript ? <Button variant="ghost" className="opening-script__restore" onClick={restoreDefault}><RotateCcw aria-hidden="true" />恢复默认</Button> : null}
        </section>}
      </div>
    </Sheet>
  )
}
