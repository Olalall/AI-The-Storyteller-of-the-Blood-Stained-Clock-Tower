import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultArchiveRuntimeSettings, saveArchiveRuntimeSettings } from '../../services/archive'
import { AISettingsSheet } from './AISettingsSheet'

vi.mock('./AssetPackSettingsSection', () => ({ AssetPackSettingsSection: () => <section>角色图标</section> }))

function openSettings() {
  render(<AISettingsSheet />)
  fireEvent.click(screen.getByRole('button', { name: '打开AI API设置' }))
}
function backendReady() {
  saveArchiveRuntimeSettings({ ...defaultArchiveRuntimeSettings, mode: 'http' })
  return vi.spyOn(window, 'fetch').mockImplementation(async (input) => new Response(JSON.stringify(
    String(input).endsWith('/api/settings/ai')
      ? { settings: { mode: 'backend_proxy', provider: 'openai-compatible', baseUrl: 'https://ai.example.test/v1', model: 'actual-server-model', apiKeyConfigured: true, timeoutSeconds: 45, contextLimit: 24000 } }
      : { ok: true, message: '测试完成' },
  )))
}

describe('AI settings reflect the effective runtime', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('does not pretend browser-only model settings control the live business calls', async () => {
    const previousSettings = JSON.stringify({ mode: 'openai-compatible', model: 'old-browser-only-model' })
    window.localStorage.setItem('botc-copilot-ai-settings-v1', previousSettings)
    const fetchSpy = vi.spyOn(window, 'fetch')
    openSettings()
    await screen.findByText('当前页面使用本地候选，未连接真实模型。')
    expect(screen.getByText('下载安装到手机/平板')).toBeVisible()
    expect(screen.getByText(/浏览器菜单/)).toBeVisible()
    expect(screen.queryByLabelText('模型名字')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('API KEY')).not.toBeInTheDocument()
    expect(screen.queryByText('流式返回')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '保存设置' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '检查配置（不调用模型）' }))
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(window.localStorage.getItem('botc-copilot-ai-settings-v1')).toBe(previousSettings)
  })

  it('shows the server model and parameters and requires an explicit choice for each paid test', async () => {
    const fetchSpy = backendReady()
    const storedRuntime = window.localStorage.getItem('botc-copilot-archive-runtime-settings-v1')
    openSettings()
    await screen.findByRole('heading', { name: 'actual-server-model' })
    expect(screen.getByText('45 秒')).toBeInTheDocument()
    expect(screen.getByText('24000 tokens')).toBeInTheDocument()
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByText('真实连通测试', { selector: 'summary' }))
    expect(screen.getByText(/可能产生 API 费用/)).toBeInTheDocument()
    const liveButton = screen.getByRole('button', { name: '测试当前模型' })
    expect(liveButton).toBeDisabled()
    fireEvent.click(liveButton)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByLabelText('我确认发起一次真实模型请求'))
    fireEvent.click(liveButton)
    await screen.findByText('测试完成')
    expect(fetchSpy).toHaveBeenLastCalledWith('http://127.0.0.1:8787/api/settings/ai/live-test', expect.objectContaining({ method: 'POST', body: '{}' }))
    expect(liveButton).toBeDisabled()
    expect(screen.getByLabelText('我确认发起一次真实模型请求')).not.toBeChecked()
    expect(window.localStorage.getItem('botc-copilot-archive-runtime-settings-v1')).toBe(storedRuntime)
  })

  it('shows an unknown state when the backend cannot be read, without offering a live test', async () => {
    saveArchiveRuntimeSettings({ ...defaultArchiveRuntimeSettings, mode: 'http' })
    vi.spyOn(window, 'fetch').mockRejectedValue(new Error('offline'))
    openSettings()
    await screen.findByText('状态未知')
    expect(screen.getByRole('heading', { name: '暂时无法确认模型' })).toBeInTheDocument()
    expect(screen.queryByText('真实连通测试')).not.toBeInTheDocument()
  })

  it('verifies site access once, clears the input and remembers the device without storing a key or passcode', async () => {
    saveArchiveRuntimeSettings({ ...defaultArchiveRuntimeSettings, mode: 'http' })
    let authorized = false
    const passcode = 'test-only-site-passcode'
    const fetchSpy = vi.spyOn(window, 'fetch').mockImplementation(async (url, init) => {
      if (String(url).endsWith('/access')) {
        expect(init?.method).toBe('POST')
        expect(JSON.parse(String(init?.body))).toEqual({ passcode })
        authorized = true
        return new Response(JSON.stringify({ ok: true }))
      }
      return new Response(JSON.stringify({
        settings: { mode: 'backend_proxy', provider: 'openai-compatible', baseUrl: 'https://provider.example.test/v1', model: 'server-model', apiKeyConfigured: true },
        access: { required: true, authorized, rememberDays: 30 },
      }))
    })
    openSettings()
    await screen.findByText('待验证访问')
    expect(screen.queryByText('真实连通测试')).not.toBeInTheDocument()
    const input = screen.getByLabelText(/AI 访问口令/)
    expect(input).toHaveAttribute('type', 'password')
    fireEvent.change(input, { target: { value: passcode } })
    fireEvent.submit(screen.getByRole('button', { name: '验证并记住此设备' }).closest('form')!)
    await screen.findByRole('button', { name: '取消此设备授权' })
    expect(screen.queryByLabelText(/AI 访问口令/)).not.toBeInTheDocument()
    expect(JSON.stringify(window.localStorage)).not.toContain(passcode)
    expect(fetchSpy.mock.calls.every(([url]) => !String(url).includes('/live-test'))).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: '关闭AI API 设置' }))
    fireEvent.click(screen.getByRole('button', { name: '打开AI API设置' }))
    await screen.findByRole('button', { name: '取消此设备授权' })
    expect(screen.queryByRole('button', { name: '验证并记住此设备' })).not.toBeInTheDocument()
  })
})
