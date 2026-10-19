import { useId, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import './night-context-editor.css'

interface Props { value?: string; disabled: boolean; onSave: (value: string) => void }

/** 未保存的编辑不进入AI请求；保存只更新当前技能草稿。 */
export function StorytellerContextEditor({ value = '', disabled, onSave }: Props) {
  const id = useId()
  const [text, setText] = useState(value)
  const changed = text.trim() !== value
  return <details className="storyteller-context">
    <summary>补充已核对事实（可选）{value ? ' · 已保存' : ''}</summary>
    <label htmlFor={id}>说书人已核对的事实</label>
    <textarea id={id} value={text} disabled={disabled} maxLength={1000} rows={3}
      placeholder="例如：上一名有效中毒目标、当前阵营、秘密生死选择、防护与恢复时点。"
      onChange={(event) => setText(event.target.value)} />
    <small>保存后用于AI核对，随本项草稿和确认记录保留；不会自动改身份、阵营、死亡或毒醉。</small>
    {!disabled ? <div className="storyteller-context__save">
      <Button variant="secondary" disabled={!changed} onClick={() => onSave(text)}>保存补充事实</Button>
      <span role="status">{changed ? '未保存，尚未用于AI' : value ? '已保存' : '尚未填写'}</span>
    </div> : null}
  </details>
}
