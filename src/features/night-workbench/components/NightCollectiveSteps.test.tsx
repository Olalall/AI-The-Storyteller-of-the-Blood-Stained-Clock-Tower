import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import { NightPlayerCarousel } from './NightPlayerCarousel'
import type { WakeItem } from '../types'

const little: WakeItem = {
 id:'little', orderIndex:1, seatId:0, playerLabel:'小怪宝 · 爪牙共同处理', roleId:'lilmonsta', roleName:'小怪宝·照看者', roleInitial:'小', iconPath:'',
 ability:'共同选择照看者', storytellerPrompt:'仅记录', progress:'pending', applicability:'applicable', status:{life:'alive',impairments:[],markers:[]},
 targetCount:1, interactionVersion:'lilmonsta/non-seated-babysitter-v1', lilMonstaStep:'babysitter', outcomeOptions:[],
}
const legion: WakeItem = { ...little, id:'legion', seatId:4, roleId:'legion', roleName:'军团', roleInitial:'军',
 playerLabel:'全体军团 · 说书人处理', lilMonstaStep:undefined, interactionVersion:'legion/collective-night-v1' }
for (const item of [little, legion]) {
 it(`conceals the collective actor in the current and neighboring ${item.roleId} cards`, () => {
  const { container } = render(<NightPlayerCarousel current={item} currentRole={{id:item.roleId,name:item.roleName,initial:item.roleInitial,iconPath:''}}
   previous={item} next={item} concealed mode="editing" onPrevious={() => {}} onNext={() => {}} />)
  expect(container).not.toHaveTextContent(item.roleName)
  expect(container).not.toHaveTextContent(item.playerLabel)
  expect(container).toHaveTextContent('处理信息已遮蔽')
  expect(container).not.toHaveTextContent('0号')
 })
 it(`shows the collective actor without inventing a player in ${item.roleId} cards`, () => {
  const { container } = render(<NightPlayerCarousel current={item} currentRole={{id:item.roleId,name:item.roleName,initial:item.roleInitial,iconPath:''}}
   previous={item} next={item} concealed={false} mode="editing" onPrevious={() => {}} onNext={() => {}} />)
  expect(container).toHaveTextContent(item.playerLabel)
  expect(container).not.toHaveTextContent('0号')
 })
}
