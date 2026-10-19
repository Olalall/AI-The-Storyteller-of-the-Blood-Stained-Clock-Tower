# 项目挑刺审查

日期：2026-07-27

## 总体评级

**GitHub alpha / preview：绿偏黄，可发布。**

**正式稳定版：黄，不建议直接宣传为正式版。**

一句话结论：核心产品闭环已经成立，但正式版前还需要修掉公开文档不一致、AI 配置文档乱码、VPS 端口/部署口径混乱、真实 AI 质量回归未系统执行、以及大规模智能板子维护风险。

## 当前已经完整的部分

- 本局常驻面板、夜晚、白天、投票、日记、结束归档、历史复盘主流程已成闭环。
- AI 配板、夜间结算建议和复盘草稿都保持“草稿/建议”边界，没有自动改权威状态。
- 117 个智能板子已注册，并有结构化质量门记录。
- 后端 archive runtime、本地 smoke、public audit 和全量 check 都通过。
- GitHub alpha / preview 包装已具备：README、THIRD_PARTY_NOTICES、PUBLIC_RELEASE_BOUNDARY、GITHUB_RELEASE_CHECKLIST、PUBLIC_RELEASE_FINAL_AUDIT、`.env.example`。
- 本地首次 commit 已完成：`80d1a40 Initial alpha preview release`。

## P0：发布前必须处理或明确声明的问题

### 1. README 对真实 AI 状态表述不一致（已修复）

证据：

- `README.md` 仍写“尚未实现真实 AI live 调用”。
- 但 `dev-docs/UNATTENDED_TASK_INDEX.md` 已记录 `10.9-live | Done | 真实连通测试入口`。
- 代码中已有 AI 设置页、后端 provider 设置、live test route 和相关测试。

影响：

- GitHub 用户会误解：到底能不能接真实模型。

建议：

- 改成：真实 AI live 测试入口已存在，但默认关闭；AI 配板/夜间/复盘仍只作为草稿建议，不自动接管权威状态。

处理：

- 已更新 `README.md`：真实 AI live test 入口存在，但默认关闭；所有 AI 输出仍只是草稿建议。

### 2. `AI_RUNTIME_STARTUP.md` 是乱码（已修复）

证据：

- `dev-docs/AI_RUNTIME_STARTUP.md` 多处出现 `?????`。
- 该文件正好是用户配置真实 AI / VPS AI 的说明文档。

影响：

- GitHub 用户或未来自己部署时，看不懂真实 AI 怎么启动。
- 这会直接影响“项目能不能用真实模型”的第一印象。

建议：

- 发布前重写为 UTF-8 中文：
  - 本地后端启动；
  - AI 环境变量；
  - 前端设置页如何填写；
  - live test 与普通校验区别；
  - 失败码解释。

处理：

- 已重写 `AI_RUNTIME_STARTUP.md`，覆盖本地/VPS AI 启动、环境变量、live test、失败码和安全边界。

### 3. VPS 端口口径不一致（已修复）

证据：

- `dev-docs/VPS_DEPLOYMENT_PREP.md` 表格写新辅助工具默认端口 `8787`。
- 同文档环境变量示例写 `BOTC_ASSISTANT_BACKEND_PORT = '3000'`。
- `scripts/sync-to-vps.ps1` 默认 `BackendPort = 3000`。
- 文档顶部又写公共 URL 为 `http://your-vps-host:3000/`。

影响：

- 部署时容易搞不清本地 runtime 默认端口、VPS 对外端口、脚本默认端口分别是什么。

建议：

- 明确三层：
  - 本地 runtime 默认：`8787`。
  - 当前 VPS 对外：`3000`。
  - sync 脚本默认：`3000`，因为服务部署在 VPS 对外端口。
- 不要在同一表里把“默认 runtime 端口”和“当前 VPS 端口”混成一个字段。

处理：

- 已更新 `VPS_DEPLOYMENT_PREP.md`：本机 runtime 默认 `8787`、当前 VPS 对外 `3000`、sync 脚本默认 `3000` 三者分开说明。

### 4. 模拟主持流程验收尚未重新执行（已修复）

证据：

- `SMOKE_HOSTING_SCENARIOS.md` 已定义替代真实局的验收路径。
- 但该文档创建后，还没有记录一次完整执行结果。

影响：

- 可以发布 alpha / preview，但不应说“模拟主持流程已按新标准完整通过”。

建议：

- 跑一次 7 / 12 / 15 人模拟主持抽样。
- 把结果写入 `SMOKE_HOSTING_SCENARIOS.md` 或单独 closure audit。

处理：

- 已新增 `tests/e2e/smoke-hosting-scenarios.spec.ts`，覆盖 7 人、15 人和缺角色图标降级。
- 已修复 `tests/e2e/manual-click-smoke.spec.ts` 中“受到影响”按钮已被 AI 预选时再次点击会取消选择的问题。
- 已执行 12 人主链路、结束归档和新增 7/15/故障降级 smoke：5 passed。
- 已把执行记录写入 `SMOKE_HOSTING_SCENARIOS.md`。

## P1：正式版前强烈建议处理

### 5. 真实 AI 质量回归还没系统化（部分修复）

风险角色：

- 赌徒
- 洗脑师
- 舞蛇人
- 方古
- 普卡
- 诺-达鲺
- 熬药女巫
- 红唇女郎
- 疯子
- 麻脸巫婆
- 数学家

当前风险：

- 真实模型可能过度追问。
- 真实模型可能把草稿说得像裁定。
- 真实模型可能遗漏复杂身份/阵营/醉酒/延迟死亡细节。

建议：

- 新增一组 AI 回归 fixture：
  - 输入当前局上下文；
  - 调用 fake/local contract 和 live provider 可选路径；
  - 断言输出包含“建议/草稿/核对点”，不包含自动确认语气。

处理：

- 已新增 `AI_NIGHT_QUALITY_REGRESSION.md` 和 `nightSettlementQualityRegression.test.ts`。
- 已覆盖 12 个本地复杂角色场景：赌徒、舞蛇人、方古、麻脸巫婆、洗脑师、普卡、诺-达鲺、红唇女郎、炼金术士、数学家、疯子。
- 仍待补：真实模型 live 抽查路径和更多高风险角色样例。

### 6. 大规模智能板子用 TS 巨型数据文件，有维护风险

证据：

当前最大文件：

- `src/domain/scripts/packs/wu-hai-tong-xing/roles.ts`：1381 行。
- `src/domain/scripts/packs/wu-hai-tong-xing/setup-templates.ts`：786 行。
- `src/domain/scripts/packs/catfishing/roles.ts`：981 行。
- `src/domain/scripts/packs/catfishing/setup-templates.ts`：453 行。

影响：

- 继续导入大量板子时，数据文件会越来越难审查。
- 角色事实复用、模板生成、source metadata 可能重复散落。

建议：

- 不要马上大重构，但应设一个“数据包治理阶段”：
  - 角色事实尽量复用共享 role facts；
  - 板子模板可考虑 JSON/生成器 + 编译时校验；
  - 巨型 pack 文件只保留 glue code，不手写上千行。

### 7. 117 个智能板子不是 117 个 confirmed 板子

证据：

- `SMART_SCRIPT_117_RUNTIME_AUDIT.md` 写明：117 个板子满足结构化智能可用门槛。
- 但大量社区/二创板子仍保持 `needs-review`。

影响：

- GitHub 用户可能误解“117 个智能板子 = 全部高质量官方级规则确认”。

建议：

- README 里避免强调“全部都完整确认”。
- 可以写“已导入 117 个智能板子包，其中部分为 needs-review，可用于早期试用和说书人核对”。

### 8. GitHub 获星包装仍缺截图 / GIF

影响：

- README 文字已经能解释项目，但陌生人理解速度仍慢。
- 这个项目强在 UI 和流程，没有截图会亏。

建议：

- 至少补 5 张图：
  - 本局常驻；
  - AI 配板；
  - 夜晚工作台；
  - 白天投票；
  - 历史复盘。

### 9. License 未决策

当前：

- README 写 `License decision pending`。

影响：

- 可以保守发布 preview。
- 但别人不能明确复用代码，可能影响 star / fork / contribution。

建议：

- 如果只想展示项目，保持 pending 可以。
- 如果想获取社区贡献，需要单独选择代码许可证，并明确第三方素材不受代码许可证覆盖。

## P2：可以暂缓

### 10. Vite 主 chunk 过大

证据：

- `npm run check` 的 build 阶段提示主 chunk 超过 500 kB。

影响：

- 本地自用和 alpha / preview 不阻塞。
- 移动端首次加载可能慢。

建议：

- 后续按页面或板子包做 code splitting。

### 11. `dev-docs/` 对外读者过重

影响：

- 文档很完整，但对 GitHub 陌生人来说可能太多。

建议：

- README 保持轻；
- dev-docs 保持内部真源；
- 后续可新增 `docs/USER_GUIDE.md`，给非开发者看，不让他们进入 dev-docs 深水区。

### 12. VPS 尚未同步最新 commit

当前：

- 本地 commit 已完成。
- VPS 未同步最新版本。

影响：

- 不影响 GitHub 发布。
- 影响你自己远端试用。

建议：

- 如果要自用远端，下一步明确执行 VPS 同步和服务重启验收。

## 不建议现在做的事

- 不建议继续无目标导入更多板子。
- 不建议现在做官方魔典同步。
- 不建议恢复常驻玩家端/收件箱。
- 不建议把夜间 AI 建议升级成自动规则引擎。
- 不建议为了解决大文件，马上引入数据库/ORM。
- 不建议在 License 没想清楚前宣传“欢迎自由复用”。

## 推荐下一步顺序

1. 系统化真实 AI 质量回归。
2. 生成 5 张 README 截图。
3. 决定是否同步 VPS。
4. 决定 License。

## 结论

当前项目已经是一个站得住的 alpha / preview 项目，不是半成品玩具。

但正式版还差三类东西：

- 文档口径一致；
- AI 质量回归；
- VPS / 发布体验稳定性。

如果目标是 GitHub 获星，最短路径不是继续加功能，而是先修文档不一致、补截图、明确 alpha 边界。
