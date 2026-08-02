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

    await user.click(screen.getByRole('button', { name: '查看导入说明' }))

    expect(screen.getByRole('heading', { name: '角色图标素材包' })).toBeInTheDocument()
    expect(screen.getByText('便捷包首次启动会询问是否安装 718 个官方及第三方图标（约 102 MB）；拒绝后不会下载。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '我已了解' })).toBeDisabled()

    await user.click(screen.getByLabelText('我已了解来源与版权提示'))

    expect(screen.getByRole('button', { name: '我已了解' })).toBeEnabled()
  })

  it('shows the community-created-content mark when assets are ready', async () => {
    const user = userEvent.setup()
    const fetcher = vi.fn(async () => ({ ok: true }))

    render(<AssetPackSettingsSection packs={packs} fetcher={fetcher} />)

    expect(await screen.findByText('已就绪')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '查看导入说明' }))

    expect(screen.getByRole('img', { name: 'Community Created Content' })).toHaveAttribute(
      'src',
      '/assets/community/ccc-sleeve.png',
    )
  })
})
