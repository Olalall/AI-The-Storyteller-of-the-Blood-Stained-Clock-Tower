# 自托管 / VPS 运行手册

日期：2026-07-27  
适用项目：`botc-storyteller-companion`

本文给本机运行或自用 VPS 部署使用。它不是 SaaS 方案，也不授权恢复玩家端、官方魔典同步器或自动规则引擎。

## 最近一次部署：2026-10-16

20 项核心玩法与数据保护修复已部署到 `https://botc.example.com/`，现有浏览器对局逐字节一致、服务器数据哈希不变。1,019 项单测、53 项生产构建浏览器场景、24 项公网场景通过；[本批逐项修复、产物、备份与回滚记录](RELEASE_2026-10-16_CORE_FIXES.md)已保存。同日[复杂局 AI 与事件复盘](RELEASE_2026-10-16_AI_REVIEW.md)、[夜间错局与 AI 设置](RELEASE_2026-10-16.md)保留历史记录。

本次使用私有 GitHub 运行包和腾讯 TAT，保留 `C:\botc-storyteller-companion`、`127.0.0.1:3000`、原任务和巡检脚本。切换前暂停三个任务并保留旧程序及数据，健康检查失败时回滚；旧哈希资源与现有图片保留。不要直接向运行目录执行下面旧同步脚本的 `Expand-Archive -Force`，它本身不提供这些保护。

## 一句话结论

推荐部署形态：

```text
浏览器前端 dist/
        ↓ 同源或同机 HTTP
Node runtime dist-server/runtime.mjs
        ↓ JSON 文件
归档数据 data/archives/archives.json
        ↓ 可选
OpenAI-compatible AI provider（Key 只放后端环境变量）
```

默认本机后端端口是 `8787`；当前自用 VPS 对外端口记录为 `3000`。旧 V2.5 保留在独立目录，不和本工具混用。

## 部署边界

允许：

- 本机运行。
- 自用 VPS 运行。
- 使用 JSON 文件保存归档。
- 使用后端环境变量接入真实 AI。
- 与旧 V2.5 共存，但目录、端口、服务名必须分开。

禁止默认做：

- 把 API Key 写进仓库、README、Issue、Release、截图或日志。
- 把官方/社区二进制素材打进公开仓库。
- 让 AI 自动修改身份、阵营、死亡、毒醉、处决或胜负。
- 把新工具部署进 `C:\botc-mvp` 等旧 V2.5 目录。
- 一边部署一边顺手改 nginx、数据库、官方魔典同步或玩家端。

## 本机运行

安装依赖：

```powershell
npm install
```

前端开发：

```powershell
npm run dev
```

后端 runtime：

```powershell
npm run dev:backend
```

默认地址：

```text
http://127.0.0.1:8787
http://127.0.0.1:8787/healthz
```

默认归档数据：

```text
data/archives/archives.json
```

如需改端口：

```powershell
$env:BOTC_BACKEND_HOST='127.0.0.1'
$env:BOTC_BACKEND_PORT='8787'
npm run dev:backend
```

## 生产构建与本地验证

完整检查：

```powershell
npm run check
npm run smoke:backend
npm run audit:public
```

单独构建：

```powershell
npm run build
npm run build:backend
```

构建产物：

```text
dist/
dist-server/runtime.mjs
```

本地打包：

```powershell
npm run package:vps
```

package 输出位置：

```text
.tmp-vps-sync/latest-package.json
.tmp-vps-sync/botc-storyteller-companion-<timestamp>.zip
```

## VPS 目录与端口建议

Windows VPS 推荐：

```text
C:\botc-storyteller-companion
C:\botc-storyteller-companion-deploy
C:\botc-storyteller-companion\logs
C:\botc-storyteller-companion\data\archives\archives.json
```

Linux VPS 推荐：

```text
/opt/botc-storyteller-companion
/opt/botc-storyteller-companion/logs
/opt/botc-storyteller-companion/data/archives/archives.json
```

| 场景 | 推荐端口 | 说明 |
| --- | ---: | --- |
| 本机开发后端 | `8787` | `npm run dev:backend` 默认值 |
| 当前自用 Windows VPS | `3000` | 已和旧 V2.5 分开 |
| 反代后公开访问 | `80` / `443` | 由 nginx/Caddy/IIS 负责，不由本项目强制 |

## 同步到 VPS

仅预览计划，不上传：

```powershell
npm run sync:vps -- -PlanOnly
```

通过环境变量配置目标：

```powershell
$env:BOTC_ASSISTANT_DEPLOY_HOST='<VPS_HOST>'
$env:BOTC_ASSISTANT_DEPLOY_USER='Administrator'
$env:BOTC_ASSISTANT_SSH_PORT='22'
$env:BOTC_ASSISTANT_REMOTE_DIR='C:\botc-storyteller-companion'
$env:BOTC_ASSISTANT_STAGING_DIR='C:\botc-storyteller-companion-deploy'
$env:BOTC_ASSISTANT_BACKEND_PORT='3000'
```

上传并解压：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/sync-to-vps.ps1 -Execute
```

如果还没确认远端目录、端口或旧 V2.5 状态，不要加 `-Execute`。

## Windows VPS 启动示例

进入部署目录：

```powershell
cd C:\botc-storyteller-companion
npm ci --omit=dev --no-fund
$env:BOTC_BACKEND_HOST='0.0.0.0'
$env:BOTC_BACKEND_PORT='3000'
$env:BOTC_STATIC_DIR='dist'
$env:BOTC_ARCHIVE_DATA_FILE='data\archives\archives.json'
node dist-server\runtime.mjs
```

健康检查：

```powershell
curl.exe http://127.0.0.1:3000/healthz
curl.exe http://<VPS_IP>:3000/healthz
```

期望返回包含：

```json
{"ok":true,"service":"botc-storyteller-backend"}
```

## 持久运行建议

当前仓库提供 Windows VPS 的最小托管脚本，不强制引入 PM2、NSSM、Docker 或 systemd。

部署包会包含：

```text
scripts/vps/start-assistant.ps1
scripts/vps/install-windows-scheduled-task.ps1
scripts/vps/check-assistant-health.ps1
```

Windows VPS 注册开机自启计划任务：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\botc-storyteller-companion\scripts\vps\install-windows-scheduled-task.ps1 `
  -AppDir 'C:\botc-storyteller-companion' `
  -NodePath 'C:\nodejs\node.exe' `
  -Port 3000 `
  -StartNow
```

这会注册名为 `botc-storyteller-backend` 的 Windows Scheduled Task，并用 `C:\nodejs\node.exe` 绝对路径启动 `dist-server\runtime.mjs`；同时注册 `botc-storyteller-backend-healthcheck` 健康检查任务。

任务由 `SYSTEM` 在开机时启动，不依赖用户登录。`ExecutionTimeLimit=PT0S` 不限制连续运行时长；`start-assistant.ps1` 会把 Node 的退出码传给计划任务，并配置失败后每分钟重试一次，最多 999 次。`StartWhenAvailable` 保留补启动能力，`IgnoreNew` 避免重复启动同一任务。

任务还保留一个从注册后一分钟开始、永久每分钟重复的时间触发器：运行中跳过，任务退出后由后续触发补启动。周期触发负责进程退出后的补启动；进程仍在但无响应时由下面的 HTTP 巡检处理。维护时先用 `Disable-ScheduledTask -TaskName 'botc-storyteller-backend'` 禁用任务；单纯停止任务会被后续触发再次拉起，维护结束后再启用并启动。

2026-10-16 已在 VPS 验证终止 Node 后由周期触发补启动；同日又完成整机软重启，开机触发器已实测生效，见下面的重启演练记录。

已有任务需同步更新 `ExecutionTimeLimit=PT0S`、`RestartCount=999` 和 `RestartInterval=PT1M`，保留开机触发器并加入上述永久重复触发器，同时更新启动脚本；仅修改本地安装脚本不会改变已注册任务。同步时保留服务器现有的启动参数。

健康检查任务同样由 `SYSTEM` 开机启动，并永久每分钟触发一次，使用 `IgnoreNew` 防止巡检重叠；单轮硬性运行时限为一分钟。它只探测本机 `http://127.0.0.1:<Port>/healthz` 和首页，每个请求最多等待五秒。健康接口须返回 `ok: true`、`service: botc-storyteller-backend`，首页须返回 HTTP 200 并包含 SPA 的 `root` 节点。

连续三轮失败才尝试重启主任务；精确匹配本部署目录 `dist-server/runtime.mjs` 的 Node 实际创建后 60 秒内清零计数并跳过，时间取进程的 `CreationDate`，不使用会被周期触发刷新的任务 `LastRunTime`。重启动作后冷却五分钟。冷却时间在重启前保存，损坏的状态文件会清零计数并保守进入五分钟冷却。重启前核对主任务工作目录和启用状态，只对这个任务执行停止、启动，不按进程名称批量结束 Node。

维护禁用主任务时，巡检只记录跳过，绝不重新启用；主任务未运行时交给已有的周期触发补启动。巡检不检查公网域名、Cloudflare 或 DNS 链路，本机健康时不会因外网故障重启服务。

部署目录的 `logs/healthcheck-state.json` 保存失败计数、最近检查时间、结果和最后尝试重启的时间；`logs/healthcheck.log` 追加巡检及调度错误记录。

2026-10-16 已在 VPS 暂停真实 Node 的线程，验证进程仍在但本机 HTTP 超时的情况：连续三轮失败后由健康任务自动重启，约 2 分 36 秒恢复 HTTP，全程未手工停止或启动主任务。该轮未做整机重启或公网 Cloudflare 故障注入。

本机已用真实假 HTTP 服务和调度器 mocks 通过 15 项检查，包含任务触发时间刷新不影响旧 Node 失败计数的回归：[可复跑自检](../.tmp/healthcheck-selfcheck-3599f28c60ad4d9792c2c8580c59615c/test-healthcheck.ps1)、[结果](../.tmp/healthcheck-selfcheck-3599f28c60ad4d9792c2c8580c59615c/selfcheck-result.json)。这些工作区临时材料不随生产包分发，也不会注册真实本地计划任务。在项目根目录运行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .tmp\healthcheck-selfcheck-3599f28c60ad4d9792c2c8580c59615c\test-healthcheck.ps1 -ProjectRoot (Get-Location).Path
```

使用 Cloudflare Tunnel 时，另装隧道巡检；它只处理隧道，不重启 BOTC：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\vps\install-cloudflare-healthcheck.ps1 `
  -AppDir 'C:\botc-storyteller-companion' `
  -TaskName 'botc-storyteller-backend' `
  -PublicUrl 'https://botc.example.com/' `
  -Port 3000
```

隧道巡检由独立的 `botc-storyteller-backend-tunnel-healthcheck` 任务以 SYSTEM 身份开机及每分钟运行，使用 `IgnoreNew`，单轮最多三分钟。本机健康接口和首页都正常后，才检查公网的同一组页面；公网探测使用随机查询参数、禁用缓存、正常校验证书，并限制等待时间。连续三轮公网失败才恢复 `Cloudflared`：已停止则启动，仍在运行则先停止；若停止超时，再核对服务 PID、进程创建时间和维护状态，只结束仍属于这次恢复的原进程。真实演练中 Windows 停止调用曾等待约 90 秒，三分钟上限为探测、停止及补启动保留余量。

隧道恢复前保存五分钟冷却和每小时最多三次的额度；公网恢复时清零失败计数，保留恢复额度。状态文件损坏时保守进入冷却。本机 BOTC 异常交给原有巡检；主任务禁用、Cloudflared 启动类型为 Disabled 时跳过。隧道 `/ready` 只辅助记录连接状态，按服务 PID 查找本机监听端口，不读取或改写含 token 的服务启动命令。公网正常时，不因 `/ready` 探测失败而重启。

维护隧道前先禁用 `botc-storyteller-backend-tunnel-healthcheck`，再用 `Set-Service -Name Cloudflared -StartupType Disabled` 阻止正在执行的巡检继续恢复，然后停止服务。维护后把启动类型恢复为 `Automatic`，启动服务并重新启用巡检。单纯停止 Cloudflared 会被巡检补启动。日志和状态分别在 `logs/cloudflare-healthcheck.log`、`logs/cloudflare-healthcheck-state.json`。现有 Windows 服务开机自动启动、进程崩溃后 20 秒重启的配置保留。

这能恢复隧道退出、部分卡死和连接异常，不能修复错误的 DNS/路由、失效 token、Cloudflare 平台故障或服务器断网。服务器对公网的探测也不能代表所有地区；共享同一个隧道的其他站点和连接会在隧道重启时短暂中断。

本机 PowerShell 5.1 已通过 22 项检查，包含停止超时、进程身份更换、维护竞态、冷却、限流和自有 StopPending 续作，以及全新 PowerShell 进程中真实服务控制对象的加载与构造：[可复跑自检](../.tmp/tunnel-selfcheck-10cf602ea1724269b7917a81492b37fc/test-cloudflare-healthcheck.ps1)、[含被测文件哈希的结果](../.tmp/tunnel-selfcheck-10cf602ea1724269b7917a81492b37fc/selfcheck-result.json)。测试拦截任务注册、服务、进程和 HTTP 操作，不修改本机真实任务或服务；隔离进程只构造、释放服务控制对象。在项目根目录运行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .tmp\tunnel-selfcheck-10cf602ea1724269b7917a81492b37fc\test-cloudflare-healthcheck.ps1 -ProjectRoot (Get-Location).Path
```

2026-10-16 已在 VPS 真实挂起 Cloudflared 的 14 个线程，确认原进程仍在、本机 BOTC 正常而公网超时。首次演练发现未显式加载 `System.ServiceProcess`，已解冻恢复访问、补上加载及隔离进程检查。第二轮由巡检在连续三次失败后自动恢复：旧隧道进程退出、新进程启动，约 4 分 6 秒后公网健康接口和首页均恢复；没有使用人工启动或解冻兜底。BOTC 进程始终为同一 PID，现有 `data/asset-packs/characters.json` 哈希不变。后续三轮巡检均回到健康状态，保留冷却和本小时恢复记录。见[线上验证结果](../.tmp/tunnel-selfcheck-10cf602ea1724269b7917a81492b37fc/remote-final-verification.json)。该轮未做整机重启或其他地区的外网探测；后续整机重启记录如下。

2026-10-16 整机软重启演练已通过，目标为上海实例 `SERVER_INSTANCE_ID`。北京时间 11:41:04 通过腾讯云 `RebootInstances`、`StopType=SOFT` 请求正常重启，Windows 本次开机时间为 11:41:19；外部每十秒探测一次，11:41:40 首次观测到公网首页及健康接口恢复，距离请求约 36 秒。这是取样观测时间，不是精确停机时长。

BOTC 主任务在开机后出现 118 → 100/200 的同实例启动事件，启动进程 PID 2124 与 Node 6020 的父进程一致；Node 在 11:41:30 创建。Cloudflared 在 11:41:25 创建、11:41:27 由 SCM 7036 记录进入运行状态；本轮没有人工启动，也没有 BOTC 或隧道巡检恢复记录，可确认两者开机自启生效。两项巡检同样有开机触发记录，后续各成功完成六次；最终均为健康、失败计数为零。

重启后观察约五分钟，Node 和 Cloudflared 的 PID 及创建时间保持不变，四条隧道连接在线。本机与公网首页、健康接口均通过，浏览器刷新后页面显示正常；三个任务定义、部署脚本及现有数据文件哈希与重启前一致。见[重启演练结果](../.tmp/reboot-drill-20261016-0338/final-verification.json)，原始事件和取样时间线保存在同目录。服务器记录位于 `C:\botc-storyteller-companion-deploy\recovery-20261016\reboot-20261016T034002Z`。该轮仅覆盖正常软重启；后续强制关机演练如下。

2026-10-16 强制关机再开机演练已通过，同样针对实例 `SERVER_INSTANCE_ID`。关机前复制了现有 `data/` 文件，核对原文件与备份 SHA-256 一致，并确认 JSON 可解析。北京时间 11:58:20 发出 `StopInstances`、`StopType=HARD` 请求，11:58:50 独立确认实例为 `STOPPED` 且对应本次请求，然后单独调用 `StartInstances` 开机。Windows 本次开机时间为 11:58:55，系统记录了 Kernel-Power 41 和 EventLog 6008，佐证非正常关机。

BOTC 主任务由 118 开机事件触发，同实例 200 事件中的进程 PID 2228 对应 Node 4588 的父进程；Cloudflared 2716 由 Windows 服务自动启动并有 SCM 7036 运行事件。两项巡检也由开机触发启动，本轮没有人工启动应用或隧道，没有巡检补启动。外部十秒间隔探测在 11:59:15 首次观测到公网首页和健康接口恢复，距开机请求约 26 秒、距强制关机请求约 56 秒；这些是取样观测时间，不是精确停机时长。

开机后观察约六分钟，两个进程的 PID 和创建时间保持不变；本机及公网首页和健康接口均通过，四条隧道连接在线，浏览器刷新正常。BOTC 本机巡检成功完成七次，隧道巡检成功完成六次，失败计数均为零。三个任务定义及部署脚本哈希未变。现有服务器数据文件集合、大小、SHA-256 与关机前一致，JSON 仍可解析，数据备份哈希也通过。见[强制关机演练结果](../.tmp/hard-power-cycle-20261016-0356/final-verification.json)，同目录保留关机请求、停稳确认、开机请求、系统事件及公网取样记录。

本轮数据备份和服务器记录位于 `C:\botc-storyteller-companion-deploy\recovery-20261016\hard-power-cycle-20261016T035710Z`，数据副本在其 `data-backup/` 子目录。数据结论覆盖服务器现有文件，本轮未模拟业务文件写入中断或物理磁盘损坏。

在管理员终端开启任务事件日志，并设为 32 MiB 循环覆盖：

```powershell
wevtutil sl Microsoft-Windows-TaskScheduler/Operational /e:true /ms:33554432 /rt:false /ab:false
```

日志位置：事件查看器 → 应用程序和服务日志 → Microsoft → Windows → TaskScheduler → Operational。这里记录任务启动、退出和重试事件；应用输出继续写到部署目录的 `logs/runtime.log`。启用日志只记录后续事件，不能补回此前未记录的停止原因。

Linux：当前只记录建议，用 systemd 托管 `node dist-server/runtime.mjs`；仓库暂未提供 Linux service 文件。

共同要求：

- 直接暴露后端端口时使用 `BOTC_BACKEND_HOST=0.0.0.0`；当前 Cloudflare Tunnel 部署保持 `127.0.0.1`，由隧道转发，不必暴露后端端口。
- 把日志写到部署目录下的 `logs/`，不要写到仓库源码目录。
- 把 AI Key 写进服务环境变量或服务器 secret，不写进启动脚本模板。

## AI 配置

真实 AI 是可选能力。不开启 AI 时，开局、夜序、投票、日志、归档都必须继续可用。

VPS 环境变量示例：

```powershell
$env:BOTC_AI_ENABLED='true'
$env:BOTC_AI_PROVIDER='openai-compatible'
$env:BOTC_AI_BASE_URL='https://api.example.com/v1'
$env:BOTC_AI_MODEL='your-model-name'
$env:BOTC_AI_API_KEY='<server-secret>'
$env:BOTC_AI_TIMEOUT_MS='30000'
$env:BOTC_AI_MAX_CONTEXT_TOKENS='12000'
```

前端页面只保存非敏感配置；真实 Key 只由后端读取。配置说明见 `AI_RUNTIME_STARTUP.md`。

## 数据备份

至少备份：

```text
data/archives/archives.json
```

建议：

- 每次部署前复制一份当前 `archives.json`。
- 每次重启服务前确认数据文件路径没有变。
- 不要把真实对局归档提交到 Git。
- 如果未来同一台 VPS 上多人高频并发写入，再考虑文件锁、单写者服务或 SQLite；当前阶段不要直接上 ORM。

## 更新流程

1. 本地确认工作区干净：

```powershell
git status --short
```

2. 本地验证：

```powershell
npm run check
npm run smoke:backend
npm run audit:public
```

3. 打包：

```powershell
npm run package:vps
```

4. 预览同步计划：

```powershell
npm run sync:vps -- -PlanOnly
```

5. 确认目录、端口、V2.5 不受影响后执行同步：

```powershell
npm run sync:vps -- -Execute
```

6. 远端安装生产依赖并重启服务。

7. 验证：

```powershell
curl.exe http://<VPS_IP>:3000/healthz
```

8. 打开浏览器验证：

```text
http://<VPS_IP>:3000/
```

## 回滚

本项目和 V2.5 分离，所以回滚只处理新工具：

- 停止新工具服务。
- 恢复上一份部署目录或上一份 zip。
- 恢复部署前备份的 `archives.json`。
- 不动 `C:\botc-mvp`。
- 不清理旧 V2.5 服务。

## 故障排查

| 现象 | 先查什么 | 常见原因 |
| --- | --- | --- |
| 页面打不开 | `curl /healthz`、端口监听、防火墙 | 服务没启动、端口未开放、host 不是 `0.0.0.0` |
| 重启后服务没起来 | `Get-ScheduledTask botc-storyteller-backend`、`logs/runtime.log` | 计划任务没注册、Node 路径不对、runtime 文件缺失 |
| 前端打开但归档失败 | 后端地址设置、`/api/archives` 响应 | 前端仍指向本地、后端没启动、CORS/反代错误 |
| AI 显示不可用 | `/api/settings/ai`、环境变量 | `BOTC_AI_ENABLED=false` 或缺 Key/model/baseUrl |
| AI 超时 | provider 网络、`BOTC_AI_TIMEOUT_MS` | 模型慢、网络不稳、限流 |
| 重启后归档没了 | `BOTC_ARCHIVE_DATA_FILE` | 数据路径变了或部署覆盖了 data 目录 |
| V2.5 受影响 | 远端目录/端口 | 错把新工具部署到旧目录或复用了旧端口 |

## 发布前最小 GO 条件

自用 VPS 进入“可用”前至少满足：

- `npm run check` 通过。
- `npm run smoke:backend` 通过。
- `npm run audit:public` 通过。
- VPS `/healthz` 通过。
- 浏览器能打开首页。
- 能保存一局归档并刷新后仍可查看。
- AI 未配置时，手动主持流程仍可用。
- 如果启用真实 AI，必须手动点一次真实连通测试。
- 旧 V2.5 访问路径不受影响。

## 相关文档

- `VPS_DEPLOYMENT_PREP.md`：V2.5 共存、当前端口和历史远端状态。
- `AI_RUNTIME_STARTUP.md`：真实 AI 本机/VPS 环境变量和错误码。
- `PUBLIC_RELEASE_BOUNDARY.md`：公开仓库与素材包边界。
- `SMOKE_HOSTING_SCENARIOS.md`：模拟主持流程、AI 质量回归和 VPS 稳定性验证。
