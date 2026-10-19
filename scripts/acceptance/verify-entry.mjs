import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
export default async function verifyEntry() {
  const output = process.env.BOTC_ACCEPTANCE_DIR
  const expected = await readFile(path.join(output, 'dist/index.html'), 'utf8')
  const response = await fetch('http://127.0.0.1:4287/', { signal: AbortSignal.timeout(15_000) })
  if (!response.ok || await response.text() !== expected) throw new Error('验收入口与本轮构建不一致，停止测试')
  await writeFile(path.join(output, 'entry.json'), JSON.stringify({
    url: response.url, verifiedAt: new Date().toISOString(),
    sha256: createHash('sha256').update(expected).digest('hex'),
    result: '本轮构建入口一致',
  }, null, 2))
}
