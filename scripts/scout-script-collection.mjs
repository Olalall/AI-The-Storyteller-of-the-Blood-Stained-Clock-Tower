import { writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const defaultUrl = 'https://antiphoton.github.io/botc/zh-cn/collection'

function readArg(name, fallback) {
  const prefix = `--${name}=`
  const hit = process.argv.find((arg) => arg.startsWith(prefix))
  return hit ? hit.slice(prefix.length) : fallback
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function encodedIdFromHref(href) {
  const url = new URL(href)
  return url.hash ? new URLSearchParams(url.hash.slice(1)).get('data') ?? '' : ''
}

async function extractVisibleScripts(page) {
  return page.evaluate(() => {
    const normalizeText = (value) =>
      String(value ?? '')
        .replace(/\s+/g, ' ')
        .trim()

    return [...document.querySelectorAll('a[href*="/script#data="]')].map((anchor) => {
      const title = normalizeText(anchor.textContent)
      const card = anchor.parentElement?.parentElement?.parentElement ?? anchor.parentElement
      const roleLabels = card
        ? [...card.querySelectorAll('div')]
            .filter((node) => node.children.length === 0)
            .map((node) => normalizeText(node.textContent))
            .filter((text) => text && text !== title && !text.includes(title))
            .filter((text, index, all) => all.indexOf(text) === index)
            .slice(0, 30)
        : []

      return {
        title,
        href: anchor.href,
        roleLabels,
      }
    })
  })
}

async function findScroller(page) {
  const handle = await page.evaluateHandle(() =>
    [...document.querySelectorAll('*')].find((element) => {
      const style = getComputedStyle(element)
      return style.overflowY === 'auto' && element.scrollHeight > element.clientHeight + 100
    }),
  )

  const value = await handle.evaluate((element) => Boolean(element))
  return value ? handle : null
}

async function main() {
  const url = readArg('url', defaultUrl)
  const limit = Number(readArg('limit', '20'))
  const out = readArg('out', '')

  if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
    throw new Error('--limit must be an integer from 1 to 200')
  }

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
  await page.waitForTimeout(1500)

  const bodyText = await page.locator('body').innerText()
  const declaredCount = bodyText.match(/剧本\s*×\s*(\d+)/)?.[1] ?? null
  const sourceGroup =
    bodyText.includes('From botcscripts.com') ? 'From botcscripts.com' : bodyText.includes('官方基础包') ? '官方基础包' : '未知'

  const seen = new Map()
  const collect = async () => {
    const scripts = await extractVisibleScripts(page)
    for (const script of scripts) {
      if (!script.href || seen.has(script.href)) continue
      seen.set(script.href, {
        sourceId: encodedIdFromHref(script.href).slice(0, 24),
        title: normalizeText(script.title),
        href: script.href,
        encodedScript: encodedIdFromHref(script.href),
        roleLabels: script.roleLabels,
      })
    }
  }

  await collect()

  const scroller = await findScroller(page)
  if (scroller) {
    for (let step = 0; seen.size < limit && step < 200; step += 1) {
      await scroller.evaluate((element) => {
        element.scrollTop += Math.max(160, Math.floor(element.clientHeight * 0.5))
      })
      await page.waitForTimeout(20)
      await collect()
    }
  }

  await browser.close()

  const result = {
    url,
    declaredCount,
    sourceGroup,
    sampledCount: Math.min(seen.size, limit),
    scripts: [...seen.values()].slice(0, limit),
    boundary: {
      writesPack: false,
      registersCatalog: false,
      changesUi: false,
      note: '采样读取器只用于来源侦察；正式导入仍需角色清点、规则清点和人工复核。',
    },
  }

  const serialized = `${JSON.stringify(result, null, 2)}\n`
  if (out) {
    await writeFile(out, serialized, 'utf8')
  }
  process.stdout.write(serialized)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
