import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NewUserGuideSheet } from './NewUserGuideSheet'

async function reachLastStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: '下一步：生成配板' }))
  await user.click(screen.getByRole('button', { name: '下一步：发送身份' }))
  await user.click(screen.getByRole('button', { name: '下一步：处理夜晚' }))
  await user.click(screen.getByRole('button', { name: '下一步：记录白天' }))
  await user.click(screen.getByRole('button', { name: '下一步：结束复盘' }))
}

describe('NewUserGuideSheet', () => {
  it('teaches one hosting stage at a time and closes after the last step', async () => {
    const user = userEvent.setup()
    render(<NewUserGuideSheet />)

    await user.click(screen.getByRole('button', { name: '新手教学' }))
    expect(screen.getByRole('heading', { name: '先选择主持方式' })).toBeVisible()
    expect(screen.getByLabelText('教学进度：第 1 步，共 6 步')).toBeVisible()
    expect(screen.getByRole('button', { name: '上一步' })).toBeDisabled()

    await reachLastStep(user)
    expect(screen.getByRole('heading', { name: '保存本局，再复盘或重开' })).toBeVisible()
    expect(screen.getByLabelText('教学进度：第 6 步，共 6 步')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '完成教学' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps the demo optional and resets to the first step when reopened', async () => {
    const user = userEvent.setup()
    const onLoadDemo = vi.fn()
    render(<NewUserGuideSheet onLoadDemo={onLoadDemo} demoAvailable />)

    await user.click(screen.getByRole('button', { name: '新手教学' }))
    await reachLastStep(user)
    await user.click(screen.getByRole('button', { name: '载入示例对局' }))
    expect(onLoadDemo).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '新手教学' }))
    expect(screen.getByRole('heading', { name: '先选择主持方式' })).toBeVisible()
  })
})
