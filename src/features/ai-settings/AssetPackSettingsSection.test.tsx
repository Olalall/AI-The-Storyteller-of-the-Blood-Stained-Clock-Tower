import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { SmartScriptPack } from '../../domain/scripts'
import { AssetPackSettingsSection } from './AssetPackSettingsSection'

const packs: readonly SmartScriptPack[] = [
  {
    scriptId: 'asset-test',
    displayName: '素材测试',
    source: { contentHash: 'hash', verifiedAt: '2026-07-27' },
    playerCounts: [7],
    roles: [
      {
        id: 'chef',
        name: '厨师',
        team: 'townsfolk',
        abilityText: '测试能力',
        iconPath: '/assets/characters/chef.webp',
        inputKinds: ['none'],
        knowledgeStatus: 'confirmed',
      },
    ],
    nightOrders: { firstNight: [], otherNight: [] },
    setupTemplates: [],
    setupRules: [],
    knowledgeStatus: 'confirmed',
  },
]

describe('AssetPackSettingsSection', () => {
  it('shows missing asset state and opens the consent guide', async () => {
    const user = userEvent.setup()
    const fetcher = vi.fn(async () => ({ ok: false }))

    render(<AssetPackSettingsSection packs={packs} fetcher={fetcher} />)

    expect(await screen.findByText('需导入')).toBeInTheDocument()
    expect(screen.getByText('0/1')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '安装说明' }))

    expect(screen.getByRole('heading', { name: '还需安装 1 个图标' })).toBeInTheDocument()
    expect(screen.getByText(/下载约 102 MB/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下载素材安装器' })).toBeDisabled()

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    await user.click(screen.getByLabelText('我接受素材来源与使用提示'))
    await user.click(screen.getByRole('button', { name: '下载素材安装器' }))

    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(screen.getByText('安装器已下载')).toBeInTheDocument()
  })

  it('shows a concise complete state when assets are ready', async () => {
    const user = userEvent.setup()
    const fetcher = vi.fn(async () => ({ ok: true }))

    render(<AssetPackSettingsSection packs={packs} fetcher={fetcher} />)

    expect(await screen.findByText('已就绪')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '安装说明' }))

    expect(screen.getByRole('heading', { name: '角色图标已经完整' })).toBeInTheDocument()
    expect(screen.queryByText('public/assets/characters/')).not.toBeInTheDocument()
  })
})
