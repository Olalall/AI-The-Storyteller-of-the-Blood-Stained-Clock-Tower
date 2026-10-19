import type { Locator, Page } from '@playwright/test'

export async function fillCurrentWakeInputs(page: Page, touch = false) {
  const press = (locator: Locator) => touch ? locator.tap() : locator.click()
  const recorder = page.locator('.wake-recorder')

  const seatGrid = recorder.locator('.seat-grid')
  if (await seatGrid.count()) {
    const counter = recorder.locator('fieldset', { has: page.locator('.seat-grid') }).locator('legend span').first()
    const [selected, required] = ((await counter.textContent()) ?? '0/0').split('/').map((part) => Number(part.trim()))
    for (let picked = selected; picked < required; picked += 1) {
      const options = seatGrid.locator('button:not([disabled])')
      const total = await options.count()
      let clicked = false
      for (let index = 0; index < total; index += 1) {
        const option = options.nth(index)
        if ((await option.getAttribute('aria-pressed')) !== 'true') {
          await press(option)
          clicked = true
          break
        }
      }
      if (!clicked) break
    }
  }

  const choiceChips = recorder.locator('.choice-chips button:not([disabled])')
  if (await choiceChips.count() && !(await recorder.locator('.choice-chips button[aria-pressed="true"]').count())) await press(choiceChips.first())

  // 工具可能已自动预选默认结果；对同一个结果再点一次等于取消，所以先确认当前没有选中项。
  const outcomes = recorder.locator('.outcome-grid button:not([disabled])')
  const alreadyChosen = recorder.locator('.outcome-grid button[aria-pressed="true"]')
  if (await outcomes.count() && !(await alreadyChosen.count())) await press(outcomes.first())
}

