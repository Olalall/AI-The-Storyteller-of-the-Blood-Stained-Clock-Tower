# Windows 零安装便捷包计划

## 目标

让不熟悉 GitHub、Node.js 或命令行的说书人只需“下载 Release、完整解压、双击启动”，同时不把 API Key、个人数据或受限制的第三方素材打进公开包。

## 冻结方案

- 提供 Windows x64 ZIP 便捷包，不引入 Electron/Tauri。
- 包含已构建的 `dist/`、`dist-server/`、启动脚本、快速开始、法律声明和 Node.js LTS 运行时。
- 构建时从 Node.js 官方分发地址下载运行时，并用官方 `SHASUMS256.txt` 校验。
- 只提取 `node.exe` 与上游 `LICENSE`，减少包体和供应链面积。
- 首次启动可配置 AI，也可跳过；API Key 只写入本机 `.env`。
- 首次启动显式询问是否安装角色图标；用户确认来源与政策后，才从 TPI Toolmaker Resources、GStone 与社区原始来源下载并校验。
- 素材下载器同时安装 Community Created Content 标识，二进制素材仍不进入 Git 或基础 Release ZIP。
- runtime 默认绑定 `127.0.0.1:8787`，端口冲突可用 `-Port` 修改。
- VPS 继续走独立的 `package:vps` / `sync:vps` 流程，不触碰 V2.5。

## 明确不做

- 不自动修改系统服务、注册表或全局环境变量。
- 不在首次启动时联网下载 npm 依赖。
- 不把 AI Key 放进 URL、日志、前端存储或 Release。
- 不把官方/社区二进制视觉素材混入公开包。
- 不把便捷包变成官方魔典、规则引擎或玩家端。

## 生成与验收

```powershell
npm run package:portable
```

构建前运行项目检查、后端 smoke 和公开发布审计。产物固定为：

`release/botc-storyteller-companion-windows-portable.zip`

验收要求：

1. 没安装系统 Node.js 时也能用包内 `runtime/node/node.exe` 启动。
2. 双击根目录 `启动血染钟楼AI说书人工具.cmd` 能打开本地页面。
3. 跳过 AI 后核心手动流程仍可用。
4. AI 设置只在本机 `.env` 生效。
5. 包中没有 `.env`、API Key、`data/archives`、`node_modules`、本机路径或 V2.5 文件。
6. 包中包含 Node.js `LICENSE`，下载归档哈希与官方校验文件一致。
7. 用户同意后可安装清单内 718 个官方及第三方角色图标；任一哈希不符立即停止且不覆盖目标文件。
8. 用户拒绝素材后不联网下载，并可稍后运行 `安装角色素材.cmd`。

## 后续升级条件

只有当“完整解压后双击脚本”仍被大量用户反馈为主要阻碍，才评估带代码签名的安装器或桌面壳。此前不扩大打包架构。
