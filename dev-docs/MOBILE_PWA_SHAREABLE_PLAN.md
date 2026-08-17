# 手机 / 平板可放心分享版计划

日期：2026-08-17

## 目标

让普通用户通过 HTTPS 地址在 Android、iPhone 和 iPad 上安装本项目，并在第一次完整加载后离线完成配板、身份交接、夜间记录、白天投票、收尾和本机复盘。真实 AI 与 VPS 归档是联网增强能力，断网不得阻塞核心手动主持。

## 产品边界

- 发布形态是 PWA，不制作 APK，不重写原生客户端。
- 手机窄屏允许把电子魔典座位环退化为列表；平板继续使用完整座位环。
- 安装、更新和离线提示不得抢占正在主持的主操作。
- 更新只提示，不在局中自动刷新。
- AI、规则和导入仍只生成草稿或候选，权威状态仍由说书人确认。
- GitHub 不写入 VPS 地址、API Key、对局数据或第三方二进制素材。
- 本轮只实现和本地验证；VPS 部署与公开发布单独确认。

## 当前事实

- React/Vite 前端已经覆盖 390px 手机夜间流程及 1024/1280px 平板布局。
- 当前没有 Web App Manifest、Service Worker、安装入口或缓存更新提示。
- 当前对局、快照、设置和本地归档以浏览器本机存储为主。
- 核心手动流程不依赖后端；真实 AI 和可选 VPS 归档依赖网络。
- 已有当前对局 JSON 导出服务，但缺少对称的导入恢复入口。
- 角色图片仍受公开发布边界限制；缺图必须继续以文字 Token 完整可用。

## 里程碑

### M1：PWA 外壳

状态：已完成并通过构建产物检查、390×844 离线重开实测。

- 增加 manifest、192/512/maskable 图标和移动端元信息。
- 生成可版本化的 Service Worker，预缓存构建产物与必要静态资源。
- 增加安装入口、离线状态和待更新提示。
- 局中不得自动刷新；立即更新必须是用户显式动作。

### M2：数据恢复闭环

状态：已完成并通过解析、组件和生产浏览器确认门测试。

- 在设置中提供当前对局导出。
- 导入前解析并显示对局摘要，不直接覆盖。
- 说书人显式确认后，先为当前局创建恢复快照，再替换为导入对局。
- 非法、损坏或不兼容文件不得修改当前局。

### M3：移动端收口

状态：自动化尺寸回归已完成；Android Chrome 与 iOS/iPadOS Safari 真机安装仍待发布前人工确认。

- 覆盖 390x844、412x915、768x1024、1024x768 与 1280x800。
- 覆盖首次打开、安装提示、离线重开、待更新提示、输入法顶起、横竖屏与安全区。
- 覆盖开局、配板、发身份、首夜、白天投票、收尾、导出和导入恢复。

### M4：公开交付

状态：README、安装教程、HUMAN_CHANGELOG 和验收记录已更新；VPS 部署与 GitHub Release 尚未执行。

- 更新 README、安装教程、PWA 使用说明和 HUMAN_CHANGELOG。
- 运行项目检查、浏览器回归、公开发布审计和 PWA 产物检查。
- 通过后再决定 VPS 部署与 `alpha.3` GitHub Release。

## 预期受影响文件

- `index.html`、`public/`、`src/main.tsx`
- `src/features/hosting-deck/` 或新的 PWA 状态组件
- `src/features/ai-settings/` 中的本机数据备份区
- `src/services/session/`
- `tests/e2e/`、`scripts/`
- `README.md`、`安装教程.md`、`dev-docs/HUMAN_CHANGELOG.md`

## 验证

```powershell
npm run check
npm run test:e2e -- tests/e2e/responsive-layout.spec.ts tests/e2e/night-workbench.spec.ts
npm run audit:public
```

另需新增：构建产物 manifest / Service Worker 检查、离线重开 smoke、导入损坏文件不改写当前局测试，以及 Android/iOS/iPad 真机验收记录。

## 主要风险

- Service Worker 旧缓存导致新旧代码混用。
- 浏览器数据被用户或系统清理；导出/导入只能降低风险，不能代替用户备份。
- iOS 安装入口与 Android 不同，不能假设存在统一安装按钮。
- 真实 AI 无法离线；普通 HTTP 公网地址也不得携带浏览器保存的 API Key。
- 第三方角色图片不能因为 PWA 缓存而绕过来源确认和公开发布边界。
