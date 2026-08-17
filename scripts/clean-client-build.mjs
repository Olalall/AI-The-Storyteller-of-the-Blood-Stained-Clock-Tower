import { existsSync, lstatSync, readFileSync, readdirSync, rmSync, unlinkSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf8'))
const outputDir = resolve(projectRoot, 'dist')

if (packageJson.name !== 'botc-storyteller-companion' || basename(outputDir) !== 'dist' || dirname(outputDir) !== projectRoot) {
  throw new Error(`[clean:client] 拒绝清理意外路径：${outputDir}`)
}

function removeTree(path) {
  if (!existsSync(path)) return
  for (const entry of readdirSync(path)) {
    const child = resolve(path, entry)
    if (lstatSync(child).isDirectory()) removeTree(child)
    else unlinkSync(child)
  }
  rmSync(path, { recursive: true, force: true })
}

removeTree(outputDir)
function containsFiles(path) {
  if (!existsSync(path)) return false
  return readdirSync(path).some((entry) => {
    const child = resolve(path, entry)
    return lstatSync(child).isDirectory() ? containsFiles(child) : true
  })
}

if (containsFiles(outputDir)) throw new Error(`[clean:client] 构建目录仍有旧文件，未能清空：${outputDir}`)
console.log('[clean:client] 已清理上一份客户端构建产物')
