import type { LabelHTMLAttributes, ReactNode } from 'react'
import './ui.css'

interface FieldProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** 字段名。渲染在控件之前，通过 label 包裹隐式关联，不需要额外 id。 */
  label: ReactNode
  /** 常态说明文字。 */
  hint?: ReactNode
  /** 错误文案。存在时以 role="alert" 播报，并给控件区域加错误描边。 */
  error?: ReactNode
  /** 表单控件本身。 */
  children: ReactNode
}

export function Field({ label, hint, error, className = '', children, ...rest }: FieldProps) {
  return (
    <label className={['ui-field', error ? 'ui-field--invalid' : '', className].filter(Boolean).join(' ')} {...rest}>
      <span className="ui-field__label">{label}</span>
      {children}
      {hint !== undefined && hint !== null && hint !== false ? <small className="ui-field__hint">{hint}</small> : null}
      {error ? <small className="ui-field__error" role="alert">{error}</small> : null}
    </label>
  )
}
