import {expect,test,type Page} from '@playwright/test'
import {loadAllSmartScriptPacks} from '../../src/domain/scripts'
import {cardinalitySession} from '../../src/features/night-workbench/state/nightCardinality.test-support'
import {abilityFixture} from '../../src/features/game-session/state/abilityChanges.test-support'
import type {GameSessionState} from '../../src/features/game-session/types'

const key='botc-copilot-session-v1'
test.beforeAll(async()=>{await loadAllSmartScriptPacks()})
const saved=(page:Page):Promise<GameSessionState>=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),key)
async function waitForRecord(page:Page,wakeItemId:string){
  await expect.poll(async()=>(await saved(page)).timeline.some(e=>e.kind==='night_action'&&e.wakeItemId===wakeItemId)).toBe(true)
}
async function seed(page:Page,session:GameSessionState){
  await page.route('**/api/ai/**',route=>route.abort())
  await page.addInitScript(({key,session})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(session))},{key,session})
  await page.goto('/')
  await expect(page.getByRole('button',{name:/^进入夜晚/})).toBeVisible()
  await page.getByRole('button',{name:/^进入夜晚/}).click()
}
async function focus(page:Page,roleName:RegExp){
  await page.getByRole('button',{name:'夜间顺序',exact:true}).click()
  await page.getByRole('dialog',{name:'夜间顺序',exact:true}).getByRole('button',{name:roleName}).click()
  const activate=page.getByRole('button',{name:/^将夜间处理位置切换/})
  if(await activate.count())await activate.click()
}
async function grant(page:Page){
  const dialog=page.getByRole('dialog',{name:'能力继承',exact:true})
  await dialog.getByLabel('判定依据',{exact:true}).fill('浏览器隔离验收：主持确认能力有效、触发及夜序时点，保留真实身份。')
  await dialog.getByRole('checkbox').check()
  await dialog.getByRole('button',{name:'确认能力调整',exact:true}).click()
  await expect(dialog).toHaveCount(0)
  await expect.poll(async()=>(await saved(page)).timeline.some(e=>e.kind==='ability_changed')).toBe(true)
}

test('哲学家获得能力后按正确夜序发动，刷新和备份保留真实身份及记录',async({page},info)=>{
  const original=cardinalitySession('chou-shen-na-ji','philosopher',13)
  await seed(page,original)
  await page.locator('.wake-recorder').getByRole('button',{name:'占卜师',exact:true}).click()
  await page.getByRole('button',{name:'记录结果',exact:true}).click()
  await page.getByRole('button',{name:'确认并下一位',exact:true}).click()
  await page.locator('.night-confirmed-handoff').getByRole('button',{name:'能力继承',exact:true}).click()
  await grant(page)
  const current=await saved(page),run=current.nightRuns[current.activeNightRunId!],added=run.queue.find(i=>i.abilitySource)!
  expect(added.roleId).toBe('fortuneteller')
  expect(added.abilitySource!.actorRole.id).toBe('philosopher')
  expect(run.queue.findIndex(i=>i.roleId==='system-demon-info')).toBeLessThan(run.queue.findIndex(i=>i.id===added.id))
  expect(run.queue.findIndex(i=>i.roleId==='washerwoman')).toBeLessThan(run.queue.findIndex(i=>i.id===added.id))
  await focus(page,/预览夜序第.*哲学家（占卜师能力）/)
  await page.getByRole('button',{name:'选择1号玩家',exact:true}).click()
  await page.getByRole('button',{name:'选择2号玩家',exact:true}).click()
  await page.getByRole('button',{name:'是',exact:true}).click()
  await page.getByRole('button',{name:'确认并下一位',exact:true}).click()
  await waitForRecord(page,added.id)
  const after=await saved(page)
  expect(after.timeline.some(e=>e.kind==='night_action'&&e.wakeItemId===added.id)).toBe(true)
  expect(after.initialPlayerStates).toEqual(original.initialPlayerStates)
  await page.screenshot({path:info.outputPath('gained-ability.png'),fullPage:true})
  await page.reload();await page.getByRole('button',{name:/^进入夜晚/}).click()
  expect((await saved(page)).timeline).toEqual(after.timeline)
  await page.getByRole('button',{name:'备份恢复',exact:true}).click()
  const downloadPromise=page.waitForEvent('download')
  await page.getByRole('button',{name:'导出当前对局',exact:true}).click()
  const download=await downloadPromise,stream=await download.createReadStream(),chunks:Buffer[]=[]
  for await(const chunk of stream!)chunks.push(Buffer.from(chunk))
  expect(JSON.parse(Buffer.concat(chunks).toString()).timeline).toEqual(after.timeline)
})

test('召唤师首夜三个不同伪装角色，不要求玩家或恶魔身份，窄屏按钮均可点',async({page},info)=>{
  const session=abilityFixture('summoner','summoner',true)
  await seed(page,session);await focus(page,/预览夜序第.*召唤师/)
  await expect(page.locator('.wake-recorder').getByText('第一个伪装角色',{exact:true})).toBeVisible()
  const groups=['第一个伪装角色','第二个伪装角色','第三个伪装角色'].map(title=>page.getByRole('group',{name:new RegExp(`^${title}`)}))
  const roles=await groups[0].locator('button').allTextContents()
  for(let index=0;index<3;index++)await groups[index].getByRole('button',{name:roles[index].trim(),exact:true}).click()
  await page.getByRole('button',{name:'记录三个伪装角色',exact:true}).click()
  await page.getByRole('button',{name:'确认并下一位',exact:true}).click()
  await expect.poll(async()=>(await saved(page)).timeline.some(e=>e.kind==='night_action'&&e.roleId==='summoner')).toBe(true)
  const after=await saved(page),entry=after.timeline.findLast(e=>e.kind==='night_action'&&e.roleId==='summoner')!
  if(entry.kind!=='night_action')throw Error('Missing Summoner record')
  expect(entry.record.snapshot.targets).toEqual([])
  expect(new Set([entry.record.snapshot.roleChoice,entry.record.snapshot.secondRoleChoice,...entry.record.snapshot.additionalRoleChoices??[]]).size).toBe(3)
  await page.screenshot({path:info.outputPath('summoner-bluffs.png'),fullPage:true})
})

test('告密者给每名爪牙单独记录三个伪装，不唤醒告密者本人',async({page})=>{
  const session=abilityFixture('snitch','snitch',true,13)
  await seed(page,session)
  const queue=session.nightRuns[session.activeNightRunId!].queue.filter(i=>i.roleId==='system-audience-snitch')
  expect(queue.length).toBeGreaterThanOrEqual(2)
  for(const item of queue){
    await page.getByRole('button',{name:'夜间顺序',exact:true}).click()
    await page.getByRole('dialog',{name:'夜间顺序',exact:true}).getByRole('button',{name:`预览夜序第${item.orderIndex}项：告密者信息`,exact:true}).click()
    const activate=page.getByRole('button',{name:/^将夜间处理位置切换/});if(await activate.count())await activate.click()
    await page.locator('.system-step-checks input[type=checkbox]').check()
    const choices=page.locator('.wake-recorder .choice-chips button');for(let index=0;index<3;index++)await choices.nth(index).click()
    await page.getByRole('button',{name:'已告知三个伪装角色',exact:true}).click()
    await page.getByRole('button',{name:'确认并下一位',exact:true}).click()
    await waitForRecord(page,item.id)
  }
  const after=await saved(page)
  expect(after.timeline.filter(e=>e.kind==='night_action'&&queue.some(i=>i.id===e.wakeItemId))).toHaveLength(queue.length)
})
