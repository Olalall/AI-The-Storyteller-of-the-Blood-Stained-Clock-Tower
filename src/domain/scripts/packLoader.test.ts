import { expect, test, vi } from 'vitest'
import { createPackLoader } from './packLoader'
import { catfishingSmartScriptPack as base } from './packs/catfishing'

test('registered unloaded scripts fail closed and concurrent loads share one request', async () => {
  let complete!: (value: typeof base) => void
  const importer = vi.fn(() => new Promise<typeof base>((resolve) => { complete = resolve }))
  const loader = createPackLoader(['catfishing', 'second'], { second: importer }, [base])
  expect(() => loader.get('second')).toThrow('尚未加载')
  const first = loader.load('second'), second = loader.load('second')
  expect(first).toBe(second)
  await Promise.resolve()
  expect(importer).toHaveBeenCalledTimes(1)
  complete({ ...base, scriptId: 'second' })
  await first
  expect(loader.get('second').scriptId).toBe('second')
  await loader.load('second')
  expect(importer).toHaveBeenCalledTimes(1)
})

test('failed and mismatched imports never register a pack, failures may be retried', async () => {
  const importer = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(base).mockResolvedValue({ ...base, scriptId: 'second' })
  const loader = createPackLoader(['catfishing', 'second'], { second: importer }, [base])
  await expect(loader.load('second')).rejects.toThrow('offline')
  await expect(loader.load('second')).rejects.toThrow('标识不匹配')
  expect(loader.packs).toHaveLength(1)
  await expect(loader.load('missing')).rejects.toThrow('不包含')
  await loader.load('second')
  expect(loader.packs.map((pack) => pack.scriptId)).toEqual(['catfishing', 'second'])
})
