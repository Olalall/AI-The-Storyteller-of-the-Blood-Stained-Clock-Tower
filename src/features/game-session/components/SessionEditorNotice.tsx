import { Button } from '../../../components/ui/Button'
import { Sheet } from '../../../components/ui/Sheet'
import { downloadSessionBackup } from '../../../services/session/sessionBackup'
import type { EditorStatus } from '../state/useGameSession'
import type { GameSessionState } from '../types'
import './session-backup.css'

export function SessionEditorNotice({ status, session, onReopen }: { status: EditorStatus; session: GameSessionState; onReopen: () => Promise<void> }) {
  const description = status === 'suspended'
    ? '返回时保留了尚未确认保存的内容，此页已暂停编辑。请先导出此页副本，再重新打开最新对局，避免旧内容覆盖新记录。'
    : status === 'blocked'
    ? '另一页面正在编辑。请回到该页面继续，或关闭它后重新打开最新对局。旧版页面或不支持快速交接的浏览器，保护可能需要约 20 秒解除。'
    : status === 'conflict'
      ? '另一页面已更新对局。此页已停止编辑，可先导出此页副本，再重新打开最新对局。'
      : '浏览器暂时无法建立编辑保护，此页已停止编辑。请检查浏览器存储设置后重新打开。'
  return <Sheet open={status !== 'ready' && status !== 'checking'} onOpenChange={() => undefined} title="编辑保护" description={description} dismissible={false} layer="nested">
    <div className="session-backup__actions">
      <Button variant={status === 'suspended' ? 'primary' : 'secondary'} onClick={() => downloadSessionBackup(session)}>导出此页副本</Button>
      <Button variant={status === 'suspended' ? 'secondary' : 'primary'} onClick={() => { void onReopen() }}>重新打开最新对局</Button>
    </div>
  </Sheet>
}
