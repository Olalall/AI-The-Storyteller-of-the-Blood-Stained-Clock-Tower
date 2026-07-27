# 外部审查回应 2026-07-17 黄灯版

## 结论

这轮外部审查对象基本正确，结论大部分可采纳。

本轮已先处理低风险且明确的结构问题：

1. 发身份领取收据迁入 `src/services/identity-deal/`。
2. 开场白文案迁入 `src/services/opening-script/`。
3. `features/night-workbench/data/catfishing.ts` 拆成角色、来源、夜序分片，原文件只保留汇总导出。
4. `features/night-workbench/state/useNightWorkbench.ts` 拆出 reducer 与草稿 helper。
5. 修正 `dev-docs/UNATTENDED_BACKEND_IMPLEMENTATION_PLAN.md` 中 `API_CONTRACT.md` 的完成状态，并补记新增 service。
6. `GameSession` 读取、保存和重置迁入 `src/services/session/`，原 `persistence.ts` 只保留兼容导出。
7. AI 配板候选、夜晚结果建议、赛后复盘草稿迁入 `src/services/ai/`，当前只使用本地原型 adapter。
8. 白天私聊/公聊倒计时读取、保存和旧 key 迁移迁入 `src/services/timer/`。
9. `features/game-session/types.ts` 拆分为 `features/game-session/model/` 下的分域类型文件，原入口只保留兼容导出。
10. 补充安全边界测试：AI service 输出不得改变权威 `GameSession` 或归档；结束对局未保存当前归档时，即使勾选确认也不能触发重置。
11. archive service API 已收口为 `archiveGame / listArchives / getArchive / resetAfterArchive`，当前仍走本地 adapter；已补命令幂等和重置拒绝测试。

## 已确认的问题

### 已处理

- `identityDealStorage.ts` 位于 feature 内并直接读写 `localStorage`：已迁移到 service。
- `openingScriptStorage.ts` 位于 feature 内并直接读写 `localStorage`：已迁移到 service。
- `catfishing.ts` 313 行纯数据文件：已拆分。
- `useNightWorkbench.ts` 287 行：已拆分为 hook、reducer、草稿 helper。
- `API_CONTRACT.md` 已存在但计划文档仍标未完成：已修正。
- `sessionReducer.ts` 462 行：已拆成根 reducer、action 类型、setup/day/night/phase/timeline/player-state reducer 和 guard 文件；根文件只保留 action 分发。
- `game-session/state/persistence.ts` 直接读写 `localStorage`：已收口到 `src/services/session/localSessionAdapter.ts`，feature 内文件只做兼容导出。
- `aiService.ts` stub/contract：已用 `src/services/ai/` 目录落地，覆盖配板候选、夜晚建议和复盘草稿；不接真实 AI，不写权威状态。
- `discussionTimer.tsx` 直接读写 `localStorage`：已收口到 `src/services/timer/localDiscussionTimerAdapter.ts`；白天倒计时仍只是本机 UI 状态。
- `features/game-session/types.ts` 256+ 行 P1 监控项：已拆成 phase/player/setup/day/night/timeline/session 分域类型。
- AI 输出边界和未归档重置边界缺少直接测试：已新增 `src/services/ai/aiService.test.ts` 和 `src/features/game-end/GameEndSheet.test.tsx` 覆盖。

### 暂未处理

- 暂无 P0 本地持久化 service 缺口；后续转向类型拆分、测试补强和后端合同。

## 对外部审查的修正

外部审查提到“4 个 UI 组件绕过 service 层”。当前核对后更准确的说法是：

- 明确属于 UI 功能绕过 service 的有 2 个：
  - 发身份领取收据。
  - 开场白文案。
- 目前生产代码里的本地持久化已集中到 `src/services/*/local*Adapter.ts`。

这两类不是本轮同级 P0，但应进入后端接入前的服务层收口计划。

## 下一步建议

下一轮不要继续加新 UI，优先做：

1. 保持 `GameSessionAction` 和 root reducer 对外接口稳定，避免 UI 大面积改动。
2. 下一轮可转向后端最小闭环准备：为 archive service 增加 HTTP adapter 草案或后端命令 handler 骨架。
3. 继续保持真实 AI、VPS、数据库选型和官方魔典同步为暂停询问项。
