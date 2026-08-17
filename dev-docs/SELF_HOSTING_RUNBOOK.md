# 自托管 / VPS 运行手册

日期：2026-07-27  
适用项目：`botc-storyteller-companion`

本文给本机运行或自用 VPS 部署使用。它不是 SaaS 方案，也不授权恢复玩家端、官方魔典同步器或自动规则引擎。

> 公开分享模式已通过源码测试和本机 HTTP smoke。下面的命令是配置示例，不代表已经部署到目标 VPS；真正上线后仍要复查 HTTPS、反向代理、防火墙和限流行为。

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

## 运行模式

### 默认：本机 / 自用模式

不设置 `BOTC_PUBLIC_ACCESS_MODE`，或显式设为 `false`，保持现有行为：

```powershell
$env:BOTC_PUBLIC_ACCESS_MODE='false'
$env:BOTC_BACKEND_HOST='127.0.0.1'
$env:BOTC_BACKEND_PORT='8787'
npm run dev:backend
```

该模式面向本机或已经由外层认证保护的自用 VPS。归档、恢复和服务器 AI 接口按原有合同工作。它不应被当作匿名公网服务直接暴露。

### 公开分享模式

要匿名分享静态页面和 PWA，必须显式启用：

```powershell
$env:BOTC_PUBLIC_ACCESS_MODE='true'
$env:BOTC_PUBLIC_AI_ALLOWED_HOSTS='api.example.com,api2.example.com'
$env:BOTC_BACKEND_HOST='127.0.0.1'
$env:BOTC_BACKEND_PORT='3000'
node dist-server\runtime.mjs
```

公开模式应形成以下边界：

| 能力 | 匿名公开 | 说明 |
| --- | --- | --- |
| 静态页面、PWA、Service Worker | 是 | 通过 HTTPS 反向代理提供 |
| `GET /healthz` | 是 | 只用于简单存活检查 |
| 浏览器本机对局、本机归档、导出恢复 | 是 | 数据留在每位用户自己的浏览器，不依赖 VPS 私有 API |
| `/api/archives*` | 否 | 可能包含完整对局和真实身份，不向匿名用户开放 |
| `/api/recovery/*` | 否 | 半局快照属于私有数据，不向匿名用户开放 |
| 使用 VPS 环境变量 Key 的 AI | 否 | 防止服务器额度被匿名消耗 |
| 用户自带 Key（BYOK）AI | 可选 | 仅限 `BOTC_PUBLIC_AI_ALLOWED_HOSTS` 中的 HTTPS 主机，并受服务端频率与请求大小限制 |

`BOTC_PUBLIC_AI_ALLOWED_HOSTS` 留空时，公开模式不提供真实 AI 代理，普通用户仍可使用本机模板、夜序、技能提示、投票、日志和离线功能。设置白名单时只写 provider 主机名，不写协议、路径、Key 或任何 VPS 地址，例如：

```powershell
$env:BOTC_PUBLIC_AI_ALLOWED_HOSTS='api.example.com'
```

公开 BYOK 请求必须同时提交完整的 HTTPS 地址、模型和用户自己的 Key；缺少任一项都会拒绝，绝不会逐字段回退到 VPS 配置。AI 请求体上限为 1 MiB、同一 runtime 可见来源地址每分钟最多 10 次 AI 请求；其他 `/api/` 请求体上限为 5 MiB、每分钟最多 30 次。白名单、限流和请求大小限制是后端安全边界，不能用 CORS、未公开网址或前端隐藏按钮代替。

当前限流故意不信任客户端可伪造的 `X-Forwarded-For`，只使用 runtime 连接看到的地址。通过 nginx 等反向代理时，所有公网请求通常会显示成同一个代理地址，因此会共享限额。这不会放宽安全边界，但可能较早触发 429；正式开放 BYOK 前要按真实代理拓扑做压力验收，不能擅自改成信任任意转发头。

重要：隐藏公网地址不是安全措施。知道网址的人可以转发，自动扫描也可能发现服务；即使 GitHub 不写 VPS 地址，也必须保留上述后端限制。

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
$env:BOTC_BACKEND_HOST='127.0.0.1'
$env:BOTC_BACKEND_PORT='3000'
$env:BOTC_STATIC_DIR='dist'
$env:BOTC_ARCHIVE_DATA_FILE='data\archives\archives.json'
node dist-server\runtime.mjs
```

健康检查：

```powershell
curl.exe http://127.0.0.1:3000/healthz
```

公网访问应由同机的带认证反向代理转发到 `127.0.0.1:3000`。不要直接把 `/api/archives`、`/api/recovery` 或 AI 接口暴露给公网；只有已经完成防火墙和反向代理保护时，才显式使用启动脚本的 `-AllowPublicBind`。

如果启用了 `BOTC_PUBLIC_ACCESS_MODE=true`，反向代理可以匿名转发静态页面、PWA 和 `/healthz`；runtime 仍应绑定 `127.0.0.1`，由后端公开模式拒绝私有归档、恢复和 VPS Key AI。不要因为启用公开模式就开放 runtime 监听端口。

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
```

Windows VPS 注册开机自启计划任务：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\botc-storyteller-companion\scripts\vps\install-windows-scheduled-task.ps1 `
  -AppDir 'C:\botc-storyteller-companion' `
  -NodePath 'C:\nodejs\node.exe' `
  -Port 3000 `
  -StartNow
```

这会注册名为 `botc-storyteller-backend` 的 Windows Scheduled Task，并用 `C:\nodejs\node.exe` 绝对路径启动 `dist-server\runtime.mjs`。

Linux：当前只记录建议，用 systemd 托管 `node dist-server/runtime.mjs`；仓库暂未提供 Linux service 文件。

共同要求：

- 默认保持 `BOTC_BACKEND_HOST=127.0.0.1`，由反向代理负责公网入口；不要为了“能访问”直接把 runtime 绑定到 `0.0.0.0`。
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

前端页面可在用户明确保存后把 BYOK 配置写入当前浏览器的 `localStorage`；这不等于上传 GitHub 或写入 VPS。公共电脑和不可信浏览器扩展环境不应保存真实 Key。VPS 自有 Key 仍只由后端环境变量读取。配置说明见 `AI_RUNTIME_STARTUP.md`。

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

7. 在 VPS 本机验证：

```powershell
curl.exe http://127.0.0.1:3000/healthz
```

8. 通过已配置的 HTTPS 反向代理地址打开浏览器验证；不要把真实域名或 IP 写回仓库文档。

```text
https://your-public-host.example/
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
| 页面打不开 | `curl /healthz`、端口监听、反向代理 | 服务没启动、代理未转发、后端地址或端口不一致 |
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
- 如果启用公开分享模式，匿名请求必须只能访问静态/PWA、`/healthz` 和经过白名单限制的可选 BYOK；私有归档、恢复和 VPS Key AI 必须返回拒绝。
- 旧 V2.5 访问路径不受影响。

## 相关文档

- `VPS_DEPLOYMENT_PREP.md`：V2.5 共存、当前端口和历史远端状态。
- `AI_RUNTIME_STARTUP.md`：真实 AI 本机/VPS 环境变量和错误码。
- `PUBLIC_RELEASE_BOUNDARY.md`：公开仓库与素材包边界。
- `SMOKE_HOSTING_SCENARIOS.md`：模拟主持流程、AI 质量回归和 VPS 稳定性验证。
