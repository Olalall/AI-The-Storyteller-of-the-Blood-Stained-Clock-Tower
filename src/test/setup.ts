import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/**
 * Node ≥ 26 自带一个实验性的全局 `localStorage`，未带 `--localstorage-file` 时它恒为 undefined，
 * 却仍然占住了这个名字，把 jsdom 本该装上的那一份顶掉。
 * 后果是本仓所有读写存档的测试在新版 Node 上一次性全红（Node 26.5 实测 55 条），
 * 报错写着 `Cannot read properties of undefined (reading 'clear')`——
 * 看起来像存档层坏了，实际只是运行环境换了。
 *
 * 这里在检测到「没有可用的 localStorage」时补一份内存实现。两个要点：
 *  1. 方法必须挂在原型上——快照轮转的测试用 `vi.spyOn(Storage.prototype, 'setItem')`
 *     模拟配额写满，方法若是实例自有属性，那个 spy 就拦不到，测试会假绿。
 *  2. 同时把 globalThis.Storage 换成这个类，让上面那个 spy 指向同一个原型。
 *
 * Node < 26（jsdom 正常装上）时整段跳过。
 */
if (typeof globalThis.localStorage === 'undefined' || globalThis.localStorage === null) {
  class MemoryStorage {
    #entries = new Map<string, string>()
    get length() { return this.#entries.size }
    key(index: number) { return [...this.#entries.keys()][index] ?? null }
    getItem(key: string) { return this.#entries.get(String(key)) ?? null }
    setItem(key: string, value: string) { this.#entries.set(String(key), String(value)) }
    removeItem(key: string) { this.#entries.delete(String(key)) }
    clear() { this.#entries.clear() }
  }
  const storage = new MemoryStorage()
  const define = (target: object) =>
    Object.defineProperty(target, 'localStorage', { configurable: true, get: () => storage })
  define(globalThis)
  if (globalThis.window && globalThis.window !== globalThis) define(globalThis.window)
  Object.defineProperty(globalThis, 'Storage', { configurable: true, writable: true, value: MemoryStorage })
}

afterEach(() => cleanup())
