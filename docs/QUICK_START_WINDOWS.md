# Windows 零安装便捷包

这是给不熟悉 GitHub、Node.js 和命令行的用户准备的启动方式。它不是安装器，不修改系统服务或注册表；完整解压后双击即可运行。

## 三步启动

1. 打开 GitHub **Releases**，下载 `botc-storyteller-companion-windows-portable.zip`。
2. 右键 ZIP，选择“全部解压”。不要在压缩包预览窗口里直接运行。
3. 双击解压目录根部的 `Start-Storyteller.cmd`。

便捷包已包含经过官方 SHA-256 校验的 Node.js LTS 运行时，不需要安装 Node.js、npm 或其他开发工具。启动后浏览器会打开 `http://127.0.0.1:8787`；关闭启动窗口即可停止本机服务。

## 首次启动与 AI

首次运行时可以填写接入地址、模型名称和 API Key，也可以跳过 AI。跳过后，记录、夜序、投票、日志和归档仍可使用。

配置只写入解压目录内的 `.env`，不会进入 GitHub，也不会显示在页面上。不要把 `.env` 发给别人、上传 GitHub 或截图公开。

重新配置 AI：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\portable\Start-Storyteller.ps1 -ReconfigureAI
```

## 不要下载错文件

GitHub 的 **Code → Download ZIP** 是源码包，不是零安装便捷包。源码包没有预构建文件和内置运行环境，适合开发者使用。

普通用户只下载 Releases 中名称完全一致的：

`botc-storyteller-companion-windows-portable.zip`

## 常见问题

- **提示缺少内置运行环境**：下载了源码 ZIP、旧版便捷包，或没有完整解压。重新下载上述 portable ZIP 并“全部解压”。
- **Windows SmartScreen 提示**：脚本尚未进行商业代码签名。确认下载来源是本项目 GitHub Release 后，可选择“更多信息 → 仍要运行”。
- **AI 不可用**：检查接入地址、模型名和 Key；AI 故障不会阻塞手动记录流程。
- **端口被占用**：在 PowerShell 中用 `-Port 8788` 启动，然后打开 `http://127.0.0.1:8788`。
- **想清空本地对局**：使用应用内“结束对局 / 重置”，不要直接删除归档文件。

## 包内运行环境与安全边界

- 内置 Node.js 的许可证位于 `runtime/node/LICENSE`。
- 便捷包不包含 API Key、个人对局数据、V2.5 服务、官方魔典同步器或玩家端。
- 第三方角色图标等二进制素材不随公开便捷包分发；缺少素材时显示文字/占位，不影响核心操作。
- AI 只给建议草稿，状态仍由说书人确认。
