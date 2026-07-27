import { RefreshCw } from 'lucide-react'
import './ui.css'

interface RoleDiscProps {
  initial: string
  roleName: string
  size?: 'small' | 'medium' | 'large'
  active?: boolean
  concealed?: boolean
  imageSrc?: string
  changed?: boolean
}

export function RoleDisc({
  initial,
  roleName,
  size = 'medium',
  active = false,
  concealed = false,
  imageSrc,
  changed = false,
}: RoleDiscProps) {
  return (
    <div
      className={`role-disc role-disc--${size} ${active ? 'role-disc--active' : ''} ${concealed ? 'role-disc--concealed' : ''}`}
      aria-label={concealed ? '角色已遮蔽' : `${roleName}${changed ? '，角色已变更' : ''}`}
    >
      <span className="role-disc__label">
        {!concealed && imageSrc ? <img className="role-disc__icon" src={imageSrc} alt="" /> : concealed ? '隐' : initial}
      </span>
      {changed && !concealed ? <span className="role-disc__change-mark" aria-hidden="true"><RefreshCw /></span> : null}
    </div>
  )
}
