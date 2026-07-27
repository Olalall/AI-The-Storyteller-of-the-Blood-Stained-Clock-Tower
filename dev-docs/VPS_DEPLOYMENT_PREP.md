# VPS 部署准备：V2.5 与新辅助工具分离

Status: Deployed on Tencent Lighthouse. Public assistant URL: http://203.0.113.10:3000/. Old V2.5 remains on http://203.0.113.10/.

## 目标

把当前新项目 `botc-storyteller-companion` 同步到 VPS 时，和旧 V2.5 明确分开：

- 旧 V2.5：保留，不删除。
- 新辅助工具：使用独立目录、独立端口、独立服务名。
- 当前同步阶段：只上传/解压新辅助工具部署包；不默认重启远端服务，不修改 nginx，不碰 V2.5。

## 默认目录与端口

| 项目 | 默认远端目录 | 默认端口 | 说明 |
|---|---|---:|---|
| V2.5 | `C:\botc-mvp` | `3000` | 旧项目保留，不由新脚本处理 |
| 新辅助工具 | `C:\botc-storyteller-companion` | `8787` | archive HTTP runtime |
| 新辅助工具临时上传 | `C:\botc-storyteller-companion-deploy` | - | 只放同步 zip |

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

## 2026-07-18 ??????

- ????????`instance-placeholder`?Windows Server 2022??? IP `203.0.113.10`?
- ? V2.5???????? `http://203.0.113.10/`????? `http://203.0.113.10/healthz` ?? `blood-on-clocktower-server`?
- ????????? `C:\botc-storyteller-companion`?????? `C:\botc-storyteller-companion-deploy`?
- ??????????`http://203.0.113.10:3000/`?
- ??????????`http://203.0.113.10:3000/healthz` ?? `botc-storyteller-backend`?
- 8787 ???????????????????????????????????????????? 3000?
- ?????`C:\botc-storyteller-companion\start-assistant.ps1`?
- ???`C:\botc-storyteller-companion\logs\runtime.log` ? `C:\botc-storyteller-companion\logs\runtime.err.log`?
- ??? SHA256?`89DD5D0DF2CCD24E27506463404E7D5525ABE3FB10CDBD7EDBCD3D27375A5E84`?
