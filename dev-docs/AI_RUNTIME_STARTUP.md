# AI Runtime 启动说明

本文说明如何在本机或自用 VPS 上启用真实 AI 后端代理。默认情况下真实 AI 关闭；AI 不可用时，开局、夜序、投票、日志、计时、归档和手动记录仍必须可用。

## 当前边界

- 前端不保存真实 API Key。
- 后端从环境变量读取 API Key。
- 真实 AI 只返回草稿、建议、追问和文案。
- AI 不会自动确认配板、修改玩家状态、写入时间线、推进昼夜或判定胜负。
- “校验配置”和“真实连通测试”是两个动作：前者不调模型，后者会发起一次 provider 请求。

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

页面操作：

1. 常驻页右上角打开齿轮。
2. 归档/后端地址填写 `http://127.0.0.1:8787`。
3. 点“刷新状态”，确认后端能读到 AI 配置状态。
4. 点“校验配置”，只检查页面填写是否完整，不调真实模型。
5. 点“真实连通测试”，才会通过后端发起一次真实 provider 请求。

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

## VPS 配置

VPS 推荐把 AI Key 放在后端环境变量、systemd/PM2 配置或服务器 secret 文件中，不写进仓库。

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
