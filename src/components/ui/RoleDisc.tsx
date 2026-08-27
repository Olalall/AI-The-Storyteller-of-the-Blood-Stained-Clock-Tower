import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import './ui.css'

interface RoleDiscProps {
  initial: string
  roleName: string
  size?: 'tiny' | 'small' | 'medium' | 'large'
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
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [imageSrc])

  const showImage = !concealed && Boolean(imageSrc) && !imageFailed

  return (
    <div
      className={`role-disc role-disc--${size} ${active ? 'role-disc--active' : ''} ${concealed ? 'role-disc--concealed' : ''}`}
      aria-label={concealed ? '角色已遮蔽' : `${roleName}${changed ? '，角色已变更' : ''}`}
    >
      <span className="role-disc__label">
        {showImage ? <img className="role-disc__icon" src={imageSrc} alt="" onError={() => setImageFailed(true)} /> : concealed ? '隐' : initial}
      </span>
      {changed && !concealed ? <span className="role-disc__change-mark" aria-hidden="true"><RefreshCw /></span> : null}
    </div>
  )
}
