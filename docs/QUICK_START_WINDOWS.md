# Windows 便捷包

这是给不熟悉 GitHub、Node.js 和命令行的使用者准备的启动方式。它不是安装器，也不会修改系统服务；解压后运行一个脚本即可。

## 使用前准备

1. 安装 [Node.js 20 LTS 或更高版本](https://nodejs.org/)。
2. 从 GitHub Release 下载 `botc-storyteller-companion-windows-*.zip`。
3. 解压到一个没有中文特殊权限限制的目录，例如 `D:\BOTC\storyteller`。

## 一键启动

双击 `scripts/portable/Start-Storyteller.cmd`（或右键 PowerShell 脚本选择“使用 PowerShell 运行”）。第一次运行时：

- 可以配置 AI：填写接入地址、模型名称和 API Key；
- 也可以跳过 AI，记录、夜序、投票、日志和归档仍然可用；
- 配置只写入解压目录里的 `.env`，不会上传到 GitHub，也不会显示在页面上。

启动后浏览器会打开 `http://127.0.0.1:8787`。关闭 PowerShell 窗口即可停止本机服务。

## 修改 AI 配置

再次运行脚本时加 `-ReconfigureAI`，或在 PowerShell 中执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\portable\Start-Storyteller.ps1 -ReconfigureAI
```

API Key 只保存在本机 `.env`。不要把 `.env` 发给别人、上传 GitHub 或截图公开。

## 常见问题

- **没有 Node.js**：安装 Node.js 20 LTS 后重试。
- **AI 不可用**：检查接入地址、模型名和 Key；即使 AI 不可用，手动记录流程不受阻塞。
- **端口被占用**：用 `-Port 8788` 启动，然后打开 `http://127.0.0.1:8788`。
- **想清空本地对局**：使用应用内的“结束对局 / 重置”，不要直接删除归档文件。

## 安全边界

便捷包不包含 API Key、V2.5 服务、官方魔典同步器或玩家端。AI 只给建议草稿，状态仍由说书人确认。
角色图标等第三方二进制素材不随公开便捷包分发；缺少素材时页面会显示文字/占位，不影响记录、夜序、投票和归档。
