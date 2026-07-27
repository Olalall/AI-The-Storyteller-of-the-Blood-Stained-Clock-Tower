# AGENTS.md

## 项目定位

- 产品名：钟楼说书人副驾驶。
- 官方/实体魔典是空间局面的主要视角，本项目不是第二套魔典，也不是自动规则引擎。
- AI、OCR、导入和规则知识只能生成候选或草稿；权威状态必须由说书人显式确认。
- 当前阶段只实现前端交互原型，不连接后端或真实 AI。

## 技术栈与命令

- React + TypeScript + Vite。
- Radix Dialog 提供可访问的 Sheet/Dialog 基元。
- 全局设计 Token 位于 `src/styles/tokens.css`；共享 UI 位于 `src/components/ui/`。
- 业务组件位于 `src/features/<feature>/`，不得把业务状态塞进共享 UI。

```powershell
npm run dev
npm run lint
npm run test
npm run build
npm run verify:architecture
npm run check
npm run test:e2e
```

## UI 规则

- 一个阶段只突出一个主操作；常用触控目标不小于 44px。
- 响应式按组件容器宽度设计，不按 OPPO/Android 型号判断。
- 完整夜序只使用一份 `NightQueueList`；分屏和全屏不得维护两套队列。
- `activeCursorId`、`previewEntryId`、草稿和纯 UI 开关必须分开。
- 滑动/浏览不能完成角色，保存失败不能推进光标，最后一位不能自动进入白天。
- 颜色不是唯一状态表达；同时提供文字或图标。
- 禁止持续旋转、循环播放、随机播放、整页横滑和高亮白闪。

## 数据与权限边界

- 中文名不能作为主键，角色使用稳定英文 ID。
- Catfishing/瓦釜雷鸣是社区脚本，保留作者、版本、来源和内容哈希，不标成官方剧本。
- 夜序来自官方 nightsheet 与在场角色的人工确认快照；不能复用旧项目按角色 ID 自动结算的代码。
- 更正追加新记录，不覆盖旧记录。
- 当前路线不做常驻玩家端或玩家收件箱；若未来恢复扫码身份领取，也必须是一次性、短时、座位级私密投影，不能把完整当局数据下发后前端隐藏。

## 架构预算

- 入口文件建议不超过 120 行。
- 页面/业务组件建议不超过 300 行。
- 共享 UI 组件建议不超过 220 行。
- 不新增巨型 HTML、万能 store、角色 ID 规则分支或第二套状态源。
- 超出预算前先拆分并更新 `dev-docs/architecture-guardrails.md`。

## 开发前后

- 修改前先读 `dev-docs/README.md`、当前阶段计划和相关合同。
- UI 改动必须运行 `npm run check`，并做真实浏览器响应式验证。
- 用户可见变化同步到 `dev-docs/HUMAN_CHANGELOG.md`。
