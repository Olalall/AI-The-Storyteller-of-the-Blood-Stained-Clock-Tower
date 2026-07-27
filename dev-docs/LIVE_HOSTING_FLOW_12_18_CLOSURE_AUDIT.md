# 12.18 完整现场流程实测收口

日期：2026-07-20

## 结论

完整现场主持链路通过。当前前端可以从常驻面板进入主要工作台，并完成：

- AI API 设置校验；
- 开场白本地展示；
- AI 配板建议、采用草稿、交换角色、确认调整；
- 夜晚单项记录并同步到常驻记录；
- 白天倒计时、白天技能/事件记录；
- 提名、举手票型、暂列、处决记录；
- 日记查看与只读投票详情；
- 保存本局、历史复盘、重置游戏；
- 重置后重新选择板子、选择人数、开局、发身份入口、夜晚队列。

本轮没有新增功能，也没有修改产品代码；只做真实浏览器验收和文档收口。

## 实测路径

### 1. 主持主流程

测试文件：

- `tests/e2e/manual-click-smoke.spec.ts`

覆盖路径：

1. 打开常驻面板。
2. 打开 `AI API 设置`，输入模型、接入地址和 API KEY，执行配置校验。
3. 验证 API KEY 不进入 `localStorage`。
4. 打开 `开场白`，编辑文案，进入大字展示，再退出。
5. 打开 `AI配板与调整`，查看 AI 配板建议，采用草稿，交换 1/2 号角色，确认调整。
6. 进入夜晚，选择目标和角色，记录结果，确认本项，返回本局。
7. 进入白天，启动私聊倒计时。
8. 记录白天技能。
9. 记录提名、举手票型、暂列处决者。
10. 确认处决，返回本局。
11. 打开玩家详情。
12. 打开日记并查看投票详情。

结果：

```text
npx playwright test tests/e2e/manual-click-smoke.spec.ts tests/e2e/game-end-prototype.spec.ts --reporter=line
2 passed
```

截图证据：

- `artifacts/screenshots/manual-click-smoke-2026-07-16/03-setup-advice.png`
- `artifacts/screenshots/manual-click-smoke-2026-07-16/05-night-before-confirm.png`
- `artifacts/screenshots/manual-click-smoke-2026-07-16/08-day-vote-before-record.png`
- `artifacts/screenshots/manual-click-smoke-2026-07-16/09-dashboard-after-execution.png`
- `artifacts/screenshots/manual-click-smoke-2026-07-16/12-journal-vote-detail.png`

### 2. 结束、复盘、重置、重新开局

测试文件：

- `tests/e2e/game-end-prototype.spec.ts`

覆盖路径：

1. 从常驻面板进入 `结束对局`。
2. 选择胜利阵营，保存本局。
3. 打开历史复盘，查看日期筛选、当局日志、AI 复盘草稿、玩家评分草稿和锐评。
4. 刷新后确认归档仍存在。
5. 回到结束页，保存后勾选确认并重置游戏。
6. 验证重置后玩家数量、座位、状态、日志、昼夜段、夜晚运行、白天草稿全部清空。
7. 验证重置后进入选择人数页面。
8. 重新打开切换板子，选择其他智能板子。
9. 重新选择 12 人并开始配板。
10. 采用候选、确认开局。
11. 打开发身份入口。
12. 进入夜晚并确认夜序按新配板生成。

结果：

```text
npx playwright test tests/e2e/manual-click-smoke.spec.ts tests/e2e/game-end-prototype.spec.ts --reporter=line
2 passed
```

截图证据：

- `artifacts/screenshots/game-end-2026-07-16/01-game-end-page.png`
- `artifacts/screenshots/game-end-2026-07-16/02-game-review-history.png`

### 3. 状态、暂存、关闭昼夜、更正等边界

测试文件：

- `tests/e2e/session-flow.spec.ts`

覆盖路径：

- 昼夜是同级入口；
- 开场白不写入对局日志；
- AI 配板候选保持草稿直到确认；
- 夜晚结果同步常驻记录但不自动切白天；
- 关闭夜晚后下一次进入才创建下一夜；
- 夜晚中途角色更换不会污染当前夜序；
- 白天技能和公开事件结构化记录；
- 未记录投票返回后可恢复；
- 未确认白天技能返回后可恢复；
- 窄屏倒计时触控目标保持可点；
- 玩家状态变更不创建昼夜段；
- 日记可筛选并追加结构化更正；
- 投票记录只读，提示回白天工作台处理；
- 窄屏日记筛选保持可触控。

结果：

```text
npx playwright test tests/e2e/session-flow.spec.ts --reporter=line
14 passed
```

## 人因验收

- 当前阶段：常驻面板显示当前记录；夜晚、白天、结束与复盘都有单独入口。
- 主操作：夜晚是确认本项/下一位，白天是记录票型/确认处决，结束页是保存本局/重置游戏。
- 权威边界：AI 配板、AI 夜间建议和 AI 复盘都只是草稿或建议；状态、处决、结束对局都需要说书人确认。
- 纠错路径：玩家状态、日记更正、白天暂存、投票暂存和重置后重新开局都有可恢复路径。
- 隐私边界：单人身份展示入口存在；当前不做常驻玩家端，不下发完整局面给玩家前端。

## 未做内容

- 没有接官方魔典同步器。
- 没有接常驻玩家端/收件箱。
- 没有把夜间结算升级为自动规则引擎。
- 没有把真实 AI live 调用纳入无人测试。
- 没有导入第二批板子。

## 后续建议

下一步不建议继续无目标打磨 UI。可选方向：

1. 导入第二批智能板子；
2. 继续深化 AI 推荐的“追问/补齐上下文”体验；
3. 做一次实机平板横屏验收；
4. 做 VPS 部署前的数据目录、端口和备份策略确认。
