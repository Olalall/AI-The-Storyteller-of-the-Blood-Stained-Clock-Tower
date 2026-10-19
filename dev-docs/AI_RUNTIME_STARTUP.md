# AI Runtime 启动说明

本文说明如何在本机或自用 VPS 上启用真实 AI 后端代理。默认情况下真实 AI 关闭；AI 不可用时，开局、夜序、投票、日志、计时、归档和手动记录仍必须可用。

## 当前边界

- 前端不保存真实 API Key。
- 公网 HTTP/HTTPS 页面的 AI 设置、配板和夜间请求固定走当前网站同源后端。首次打开无需预写浏览器设置；旧归档选择本地或其他服务器，也不会改变 AI 或访问口令的接收地址。此选择不会迁移或改写任何归档、对局及归档运行设置。
- `localhost`、`127.0.0.1`、`[::1]` 及离线页面保留原有开发方式：默认本地候选，显式 HTTP 运行设置可连接独立开发后端。
- 现有复盘接口按归档 ID 在所选归档服务器查找记录，仍使用归档运行设置；它不属于上述付费 AI 代理链，本轮不改变其请求合同或默认行为。
- 后端从自己的进程环境读取 API Key；Windows 计划任务启动时由受保护的 DPAPI 配置注入。
- 真实 AI 只返回草稿、建议、追问和文案。
- AI 不会自动确认配板、修改玩家状态、写入时间线、推进昼夜或判定胜负。
- “校验配置”和“真实连通测试”是两个动作：前者不调模型，后者会发起一次 provider 请求。
- 真实连通测试只接受空请求体或 `{}`，只使用服务器已启用的既定配置；客户端不能临时改 provider、地址、模型、Key 或超时。关闭 AI 时即使服务器已有 Key 也不发请求。
- 所有 provider 请求拒绝 HTTP 重定向，调试日志不记录上游原文或密钥。配置访问口令后，付费 AI 路由及真实连通测试先检查设备授权、请求来源，再处理业务。公网启用必须同时配置私有访问口令和本站 origin；页面上的费用确认不替代服务器权限检查，见 [AI_SERVER_SECRETS.md](AI_SERVER_SECRETS.md)。

## 本机启动

PowerShell 示例：

```powershell
$env:BOTC_AI_ENABLED='true'
$env:BOTC_AI_PROVIDER='openai-compatible'
$env:BOTC_AI_BASE_URL='https://api.example.com/v1'
$env:BOTC_AI_MODEL='your-model-name'
$env:BOTC_AI_API_KEY='your-local-secret'
$env:BOTC_AI_TIMEOUT_MS='30000'
$env:BOTC_AI_MAX_CONTEXT_TOKENS='12000'
npm run dev:backend
```

默认后端地址：

```text
http://127.0.0.1:8787
```

本机前端：

```powershell
npm run dev
```

公网页面操作：

1. 常驻页右上角打开齿轮。
2. 查看本站固定模型；首次输入站点访问口令并验证设备，不填写提供商 Key 或归档地址。
3. 点“刷新状态”，读取服务器实际生效配置。
4. 点“检查配置（不调用模型）”，只检查服务器配置，不调真实模型。
5. 如需真实测试，展开“真实连通测试”，单独勾选费用确认再发起一次请求。

本机开发沿用已有 local/http 运行配置，连接独立开发后端时需在开发配置中指定 `http://127.0.0.1:8787`；齿轮页面不提供 API 地址、模型或 Key 编辑表单。这项开发兼容配置不影响公网站点默认同源，也不自动迁移归档。

## 环境变量

| 变量 | 示例 | 说明 |
| --- | --- | --- |
| `BOTC_AI_ENABLED` | `true` / `false` | 是否启用真实 AI provider。默认关闭 |
| `BOTC_AI_PROVIDER` | `openai-compatible` | 当前只支持 OpenAI-compatible 形态 |
| `BOTC_AI_BASE_URL` | `https://api.example.com/v1` | provider 接入地址 |
| `BOTC_AI_MODEL` | `your-model-name` | 模型名 |
| `BOTC_AI_API_KEY` | 本地 secret | 只允许后端读取，不返回前端 |
| `BOTC_AI_TIMEOUT_MS` | `30000` | provider 请求超时 |
| `BOTC_AI_MAX_CONTEXT_TOKENS` | `12000` | 上下文预算上限 |
| `BOTC_AI_ACCESS_SECRET` | 私有随机口令 | 公网启用时必填，32–256 字符；不返回前端 |
| `BOTC_AI_PUBLIC_ORIGIN` | `https://botc.example.com` | 公网启用时必填，纯 origin；用于来源校验与安全 cookie |

## VPS 配置

VPS 推荐把 AI Key 放在后端环境变量、systemd/PM2 配置或服务器 secret 文件中，不写进仓库。

下面只示意提供商字段，公网上线还必须配齐上述访问口令和公网 origin。当前 Windows VPS 的长期配置和安全传送按 [AI_SERVER_SECRETS.md](AI_SERVER_SECRETS.md) 执行；未配齐时保持真实 AI 关闭。

```bash
BOTC_AI_ENABLED=true
BOTC_AI_PROVIDER=openai-compatible
BOTC_AI_BASE_URL=https://api.example.com/v1
BOTC_AI_MODEL=your-model-name
BOTC_AI_API_KEY=your-server-secret
BOTC_AI_TIMEOUT_MS=30000
BOTC_AI_MAX_CONTEXT_TOKENS=12000
```

如果 VPS 没有配置 `BOTC_AI_API_KEY`，前端应显示 AI 未配置或不可用，但手动流程继续。

以上 PowerShell 环境变量只属于当前进程及其子进程，不会自动持久到 Windows 的 SYSTEM 计划任务。`scripts/vps/start-assistant.ps1` 不读取项目 `.env`；长期配置使用服务器 DPAPI 私有文件，在每次启动时注入 Node。配置白名单、首次访问保护、CMS 加密传送、备份恢复与验收见 [Windows 服务器固定 AI 配置](AI_SERVER_SECRETS.md)。真实 Key 不应写入 TAT 命令正文、计划任务参数、仓库或日志。

## 常见错误

| 状态码 / code | 含义 | 处理方式 |
| --- | --- | --- |
| `AI_PROVIDER_DISABLED` | 后端未启用真实 AI | 设置 `BOTC_AI_ENABLED=true` 后重启后端 |
| `AI_PROVIDER_UNCONFIGURED` | 缺 baseUrl、model 或 apiKey | 补齐环境变量 |
| `AI_PROVIDER_TIMEOUT` | provider 超时 | 稍后重试；现场改走手动记录 |
| `AI_PROVIDER_RATE_LIMITED` | provider 限流 | 不要自动刷请求；稍后再试 |
| `AI_PROVIDER_BAD_RESPONSE` | 模型返回不符合合同 | 丢弃结果，保留手动流程 |
| `AI_PROVIDER_UNAVAILABLE` | 网络或服务不可用 | 回退本地草稿/手动处理 |

## 验证命令

默认验证，不调用真实模型：

```powershell
npm run smoke:backend
npm run check
```

可选真实模型夜间质量 smoke，会消耗外部 API：

```powershell
$env:BOTC_AI_BASE_URL='https://your-provider.example/v1'
$env:BOTC_AI_MODEL='your-model-name'
$env:BOTC_AI_API_KEY='your-secret'
npm run smoke:ai-night-live
```

## 安全检查

- 不要提交 `.env` 或任何真实 Key。
- `.env.example` 只能写占位符。
- 公开前运行：

```powershell
npm run audit:public
```

## 失败时的产品表现

AI 不可用不应中断主持。至少这些功能必须继续可用：

- 智能板子模板库；
- 手动配板调整；
- 夜序；
- 夜间记录；
- 白天投票；
- 日记和更正；
- 公聊倒计时；
- 结束归档和历史复盘。
