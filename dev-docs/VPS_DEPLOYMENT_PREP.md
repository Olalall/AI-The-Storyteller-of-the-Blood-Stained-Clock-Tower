# VPS 部署准备：V2.5 与新辅助工具分离

Status: Deployed on Tencent Lighthouse. Public assistant URL: http://your-vps-host:3000/. Old V2.5 remains on http://your-vps-host/.

> 安全说明：VPS 的真实公网地址只在部署者私下保存和分享，不写入仓库；这里的 `your-vps-host` 只是占位符。

## 目标

把当前新项目 `botc-storyteller-companion` 同步到 VPS 时，和旧 V2.5 明确分开：

- 旧 V2.5：保留，不删除。
- 新辅助工具：使用独立目录、独立端口、独立服务名。
- 当前同步阶段：只上传/解压新辅助工具部署包；不默认重启远端服务，不修改 nginx，不碰 V2.5。

## 目录与端口口径

| 项目 | 目录 | 端口 | 说明 |
|---|---|---:|---|
| V2.5 | `C:\botc-mvp` | 旧服务端口 | 旧项目保留，不由新脚本处理 |
| 新辅助工具本地 runtime 默认 | 本机项目目录 | `8787` | `npm run dev:backend` 默认端口 |
| 当前 VPS 新辅助工具 | `C:\botc-storyteller-companion` | `3000` | 当前对外访问端口：`http://your-vps-host:3000/` |
| 新辅助工具临时上传 | `C:\botc-storyteller-companion-deploy` | - | 只放同步 zip |

不要把这三层混在一起：

- 本机开发默认端口：`8787`。
- 当前 VPS 对外端口：`3000`。
- `scripts/sync-to-vps.ps1` 默认 `BackendPort=3000`，是为了匹配当前 VPS 对外端口，不代表本机 runtime 默认端口。

如果 VPS 是 Linux，需要把远端目录改成 Linux 路径，例如：

- `/opt/botc-storyteller-companion`
- `/tmp/botc-storyteller-companion-deploy`

## 不做

- 不删除 V2.5。
- 不停止 V2.5。
- 不覆盖 `C:\botc-mvp`。
- 不复用 V2.5 的端口 `3000`。
- 不把新辅助工具部署到 V2.5 目录。
- 不接真实 AI。
- 不写 API Key。
- 不修改官方魔典同步逻辑。

## 本机准备命令

只打包，不上传：

```powershell
npm run package:vps
```

计划模式，不上传：

```powershell
npm run sync:vps -- -PlanOnly
```

上传并解压到独立目录：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/sync-to-vps.ps1 `
  -HostName <VPS_HOST> `
  -User <SSH_USER> `
  -RemoteDir 'C:\botc-storyteller-companion' `
  -StagingDir 'C:\botc-storyteller-companion-deploy' `
  -Execute
```

## 需要的环境变量

也可以用环境变量代替参数：

```powershell
$env:BOTC_ASSISTANT_DEPLOY_HOST = '<VPS_HOST>'
$env:BOTC_ASSISTANT_DEPLOY_USER = '<SSH_USER>'
$env:BOTC_ASSISTANT_REMOTE_DIR = 'C:\botc-storyteller-companion'
$env:BOTC_ASSISTANT_STAGING_DIR = 'C:\botc-storyteller-companion-deploy'
$env:BOTC_ASSISTANT_BACKEND_PORT = '3000'
```

如果只是本机启动，不需要这些 VPS 同步变量；本机后端默认读 `BOTC_BACKEND_PORT`，未设置时为 `8787`。

## VPS 只读确认

真正启动服务前，先在 VPS 上确认：

```bash
free -h
df -h
ss -lntp
ps aux --sort=-%mem | head -30
```

Windows VPS 可查：

```powershell
Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 20 ProcessName,Id,WorkingSet64
netstat -ano | findstr LISTENING
```

## 验收

本地同步包验收：

```powershell
npm run check
npm run smoke:backend
npm run package:vps
```

远端后端启动后验收：

```powershell
curl http://127.0.0.1:3000/healthz
```

如果通过域名反代：

```powershell
curl https://<your-domain>/healthz
```

## 回滚

- V2.5 文件和服务不由本脚本修改，因此旧项目可以继续保留。
- 新辅助工具如果部署失败，只需要停止新服务或改回 nginx 代理，不需要恢复 V2.5。
- 本机 V2.5 备份已确认存在：
  - `<local-v2.5-backup-path>/botc-v2.5-complete-private-backup-20260713.zip`
  - SHA256 已核对。

## 2026-07-18 远端状态记录

- 腾讯云轻量服务器：Windows Server 2022，公网 IP `your-vps-host`。
- 旧 V2.5 继续保留在 `http://your-vps-host/`，不由新项目脚本处理。
- 新辅助工具目录：`C:\botc-storyteller-companion`。
- 新辅助工具临时上传目录：`C:\botc-storyteller-companion-deploy`。
- 新辅助工具对外地址：`http://your-vps-host:3000/`。
- 新辅助工具健康检查：`http://your-vps-host:3000/healthz`。
- 远端服务名曾记录为 `botc-storyteller-backend`。
- 本机 runtime 默认 `8787`；当前 VPS 对外使用 `3000`，避免与旧服务和访问习惯混淆。
- 曾记录启动脚本：`C:\botc-storyteller-companion\start-assistant.ps1`。
- 曾记录日志路径：
  - `C:\botc-storyteller-companion\logs\runtime.log`
  - `C:\botc-storyteller-companion\logs\runtime.err.log`
- 历史部署包 SHA256：`89DD5D0DF2CCD24E27506463404E7D5525ABE3FB10CDBD7EDBCD3D27375A5E84`。

## 2026-07-27 远端同步记录

- 同步 commit：`d0416ef`。
- 部署包：`botc-storyteller-companion-20260727-170223.zip`。
- 部署包 SHA256：`F8C050D235D82746D3723E852D44785996162C9B6A1F95F776D05FD2C565CD56`。
- Release asset 地址：`https://github.com/Olalall/botc-storyteller-companion/releases/download/alpha-preview-20260727/botc-storyteller-companion-20260727-170223.zip`。
- SSH/SCP 路径失败：`your-vps-host:22` 连接被关闭。
- GitHub Release asset 远端下载失败：VPS 上 `curl` / `Invoke-WebRequest` 到 GitHub 均出现连接重置或无法连接远程服务器。
- 实际成功路径：Tencent TAT 分片写入 zip base64 → 远端重组 zip → SHA256 校验 → 备份旧新工具目录 → 解压 → 使用绝对路径启动 Node runtime。
- 远端 Node 路径：`C:\nodejs\node.exe`。
- TAT 以 SYSTEM 身份运行时找不到 `npm.cmd`，本次跳过 `npm ci` 后直接启动 `dist-server\runtime.mjs`；当前 runtime 打包产物可独立启动。
- 后续已补充正式脚本：`scripts\vps\start-assistant.ps1` 和 `scripts\vps\install-windows-scheduled-task.ps1`；部署包会自动携带，用于把 `C:\nodejs\node.exe` 绝对路径固化到 Windows Scheduled Task。
- 新工具远端健康检查通过：`http://your-vps-host:3000/healthz` 返回 `{"ok":true,"service":"botc-storyteller-backend"}`。
- 新工具首页通过：`http://your-vps-host:3000/` 返回 200。
- 旧 V2.5 首页仍可访问：`http://your-vps-host/` 返回 200。
- 备份目录由远端脚本创建在：`C:\botc-storyteller-companion-deploy\backup-20260727-172205`。

## 2026-07-27 Windows Scheduled Task 托管记录

- 已把仓库脚本写入远端：`C:\botc-storyteller-companion\scripts\vps\start-assistant.ps1`。
- 已把仓库脚本写入远端：`C:\botc-storyteller-companion\scripts\vps\install-windows-scheduled-task.ps1`。
- 已注册 Windows Scheduled Task：`botc-storyteller-backend`。
- 任务运行身份：`SYSTEM`。
- 任务启动 Node：`C:\nodejs\node.exe`。
- 任务启动目录：`C:\botc-storyteller-companion`。
- 任务端口：`3000`。
- 安装后任务状态：`Ready`。
- 安装后当前服务健康检查通过：`http://127.0.0.1:3000/healthz` 返回 `{"ok":true,"service":"botc-storyteller-backend"}`。
- 本次没有重启 VPS，没有改旧 V2.5，没有写入真实 AI Key。
