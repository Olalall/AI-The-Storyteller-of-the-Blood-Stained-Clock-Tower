# 真机验收入口

准备日期：2026-09-08。目标为 React 新版，不是同目录旁的旧 V2.5。

## 本次入口

- 测试地址：`http://LAN_IP:4183/`。
- 电脑当前以太网地址为 `LAN_IP`。手机/平板需要能访问同一局域网，电脑和本地 preview 进程需要保持运行。
- 这是本地 `dist` 的生产预览，仅绑定该局域网地址；不是 VPS 部署，没有修改防火墙。
- 页面上的对局保存在访问设备自己的浏览器。手机、平板和电脑不会自动同步；不同端口/地址的存档也相互独立。需要转移时用备份导出/导入。

重新启动入口：在新版项目目录运行下面的命令；若电脑 IP 已改变，先核对真实网卡地址。

```powershell
npm run build
npm run preview -- --host LAN_IP --port 4183 --strictPort
```

本次运行中更新构建使用 `npm run build -- --emptyOutDir false`，保留旧哈希资源，避免已打开页面的后续分包请求立即失效；新打开或刷新页面使用最新入口。常规发布仍需完整构建、独立验收。

## 真机第一轮操作

1. 在手机和平板上分别打开链接，记录设备型号、系统和浏览器版本，并确认首页正常出现。
2. 在测试局添加一条状态待办，确认后刷新，检查待办仍在；待办不能自动改变玩家生死或夜序。
3. 打开一个玩家的状态面板，查看按钮是否完整，尝试输入文字时检查系统键盘是否挡住确认按钮。
4. 按 [六昼夜验收](LONG_SESSION_ACCEPTANCE.md) 中的流程，在实际设备上再验证一次草稿刷新、切后台返回和存档恢复。

若网页打不开，先记录是超时、拒绝连接还是其他提示，以及电脑/设备所连接的网络；本机能访问自身局域网地址不代表已穿过防火墙或无线客户端隔离。没有设备访问结果前，不标记真机验收通过。

## 本轮修复与本机证据

HTTP 局域网页面不是安全上下文，`crypto.randomUUID` 不可用。原状态待办提交直接调用该接口会报错；已改用 `crypto.getRandomValues` 生成128位随机记录标识，保持原有数据和确认流程。该值是本地记录ID，不用于身份认证。

本机通过真实 LAN URL 的浏览器验证已覆盖：390/820px、非安全上下文下连续添加2条待办、ID不重复、保存刷新后内容完整、原时间线和玩家状态不变、无页面异常。测试代码 `tests/load-performance/lan-followup.spec.ts` 在默认生产预览回归中模拟 UUID API 缺失；专用配置在真实 LAN HTTP 下直接断言 `isSecureContext === false`，不打补丁。

```powershell
$env:BOTC_DEVICE_URL='http://LAN_IP:4183/'
npx playwright test --config playwright.lan.config.ts --workers=1
```

专用配置复用已经运行的服务，不会自动部署或启动远端服务。通过状态位于 `.codex-artifacts/device-entry/followups`；入口HTML核对、IndexedDB、保存刷新和布局的本机检查位于 `.codex-artifacts/device-entry/check.json`。这些均为本机浏览器证据，真实手机/平板结果待用户反馈。
