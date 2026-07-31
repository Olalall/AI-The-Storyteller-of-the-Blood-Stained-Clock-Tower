# Windows 便捷包计划

## 目标

让不会使用 GitHub、Node.js 或命令行的说书人也能运行本项目，同时不把 API Key、个人数据或第三方素材打进公开仓库。

## 冻结方案

- 首版提供 Windows ZIP 便捷包，不引入 Electron/Tauri。
- 便捷包包含已构建的 `dist/`、`dist-server/`、启动脚本、快速开始和法律声明。
- 首次运行由 `Start-Storyteller.ps1` 询问是否配置 AI；AI 是可选项。
- API Key 只写入本机 `.env`，不进入 GitHub、Release 压缩包或前端页面。
- 本地 runtime 默认绑定 `127.0.0.1:8787`，端口冲突可通过 `-Port` 改变。
- VPS 仍使用独立的 `package:vps` / `sync:vps` 流程，不与便捷包共用部署目录，也不触碰 V2.5。

## 不做

- 不把 Node.js 运行时打进第一版压缩包；用户先安装 Node.js 20 LTS 或更高版本。
- 不在启动脚本中自动下载依赖、修改系统服务或写入注册表。
- 不把 AI Key 放在 URL、命令行参数、日志或浏览器 localStorage。
- 不把便捷包当作官方魔典、规则引擎或玩家端。

## 生成与验收

```powershell
npm run package:portable
```

打包前自动运行 `check`、`smoke:backend` 和 `audit:public`。生成物位于 `release/`，并应检查：

1. 双击 `Start-Storyteller.cmd` 后能打开本地页面。
2. 跳过 AI 时，记录、夜序、投票、日志和归档仍可用。
3. 配置 AI 后，设置只在本机 `.env` 生效。
4. 压缩包中没有 `.env`、API Key、`data/archives`、本机路径或 V2.5 文件。

## 后续升级条件

只有当用户持续反馈“Node.js 安装”是主要阻塞，才评估 Electron/Tauri；在此之前不扩大桌面打包架构。
