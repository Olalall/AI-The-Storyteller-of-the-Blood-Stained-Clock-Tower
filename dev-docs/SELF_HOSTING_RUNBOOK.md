# 自托管 / VPS 运行手册

日期：2026-07-27  
适用项目：`botc-storyteller-companion`

本文给本机运行或自用 VPS 部署使用。它不是 SaaS 方案，也不授权恢复玩家端、官方魔典同步器或自动规则引擎。

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

当前仓库不强制引入 PM2、NSSM、Docker 或 systemd。自用 VPS 可以按熟悉程度选一种。

最小建议：

- Windows：用计划任务、NSSM 或 PM2 托管 `node dist-server\runtime.mjs`。
- Linux：用 systemd 托管 `node dist-server/runtime.mjs`。
- 保持 `BOTC_BACKEND_HOST=0.0.0.0`，否则公网无法访问。
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
