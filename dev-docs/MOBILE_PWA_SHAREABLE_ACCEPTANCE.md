# 手机 / 平板可放心分享版验收

日期：2026-08-17
目标版本：`0.1.0-alpha.3`

## 已完成

- Web App Manifest、安装图标和独立窗口模式。
- Service Worker 预缓存当前构建；旧缓存会清理，`/api/` 强制只走网络。
- 首次打开分成“安装或先试用 → 选择主持方式 → 开始配板”；回访用户直接沿用上次模式进入精简开局页。
- 安装事件由应用顶层保留；针对 iOS Safari 和无安装事件浏览器的手动安装路径已有明确文案，应用设置长期保留安装入口。
- 离线能力提示与安全更新提示；进行中的对局不会出现立即更新动作。
- 当前对局 JSON 导出、2 MB 导入上限、内部结构校验、兼容迁移、摘要预览、明确确认和导入后立即撤销。
- 空对局和已开局都可以进入“应用设置”管理备份。

## 自动验收证据（Chromium）

以下证据来自 Playwright Chromium、设备尺寸/触控/UA 模拟和生产构建，不代表已经在 Android Chrome 或 iPhone/iPad Safari 真机完成验收。

```powershell
npm run verify:pwa
npm run test:e2e:pwa
npm run test:e2e:mobile-audit
npm run test:e2e -- tests/e2e/responsive-layout.spec.ts tests/e2e/night-workbench.spec.ts
```

- PWA 产物：通过；离线预缓存 14 项、约 6.2 MB；Manifest、SW、图标、注册接口、构建残留清理和 API 不缓存均通过。
- 生产 PWA：3 / 3 通过；覆盖 390×844 离线重开、无横向溢出、导入确认/撤销，以及 412×915 断网后的夜间记录和白天票型。
- 既有响应式与夜间流程：14 / 14 通过；覆盖 390、480、720、828、1024、1280、1440 和 1728 宽度。
- 导入解析与组件相关测试：16 / 16 通过。
- 更新安全门测试：2 / 2 通过；局中只能暂缓，结束后仍会重新出现明确更新按钮。
- 最终候选全项目门禁：284 个测试文件通过、1 个跳过；1820 项测试通过、3 项可选 live 测试跳过；生产构建、PWA 产物和架构守门通过。
- 最终候选 Chromium 浏览器回归：48 / 48 通过、2 项可选 live 测试跳过；覆盖首次/回访引导、原有桌面主持、手机尺寸、分屏、平板尺寸、多标签只读和角色夜序流程。
- Chromium 人工式触控回归：9 / 9 通过、3 项按模拟设备范围跳过；覆盖 360px Android、390px Android、768px iPad 尺寸的首次/回访引导、快速双击、设置滚动与输入、7 人配板、离线夜间和投票，以及手机 200% 大字体回流。
- 可见交互区自动检查不小于 44×44 CSS px；打开设置不再自动发出 718 个角色图标 HEAD 请求，素材检测改为用户点击“重新检测”后执行。
- 未开局时不显示阶段、记录和收尾导航；“开始配板”和“先浏览板子”都必须先明确选择主持方式。

截图：

- `artifacts/screenshots/pwa-phone-390-offline.png`
- `artifacts/screenshots/pwa-phone-390-import-preview.png`
- `artifacts/screenshots/onboarding-phone-hosting-mode.png`
- `artifacts/screenshots/returning-phone-session-entry.png`

## 发布前仍需人工确认

- Android Chrome 真机：安装、桌面启动、断网重开。
- iPhone/iPad Safari 真机：添加到主屏幕、安全区、横竖屏和断网重开。
- 公开 HTTPS 部署后的首次缓存、版本更新提示和后端 AI 降级。

VPS 部署、GitHub Release 和真机人工验收不属于本地实现动作，需项目所有者单独确认执行。

上述数字来自 2026-08-17 的最终候选工作树；创建提交后如果又修改代码，发布前必须在新提交上重跑相同命令。
