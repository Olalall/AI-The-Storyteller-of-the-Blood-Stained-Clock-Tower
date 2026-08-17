# 公开发布边界

本文件定义 GitHub 公开仓库前的最低边界。它不是法律意见；如果要商业化、大范围传播或打包分发素材，仍需要重新核对最新官方条款。

## 允许公开的内容

- 项目源码、测试、文档和构建脚本。
- 自己编写的 UI、服务层、模拟数据、质量门和 smoke 脚本。
- 对规则、夜序、角色能力的结构化引用与摘要，但必须标明来源和非官方性质。
- 素材清单、来源说明、hash 和导入指引。

## 默认不提交的内容

- API Key、token、cookie、私钥、服务器密码或连接字符串。
- 本机路径、聊天截图、临时文件、个人账号信息。
- 官方或社区角色图标、板子图片、截图素材等二进制资产。
- VPS 部署产物、日志、归档数据和历史对局记录。

相关忽略规则：

```text
public/assets/characters/*.{webp,png,jpg,jpeg,gif,svg}
public/assets/community/*
!public/assets/community/README.md
.env
.env.*
!.env.example
```

## 素材包策略

公开仓库只保留：

- 素材来源说明；
- manifest/hash；
- 导入路径；
- 免责声明；
- 缺素材时的降级 UI。

不在公开仓库默认携带：

- 官方角色 WebP；
- 社区袖标、板子图、截图图；
- 从网页抓取的任何素材。

当前可选下载器以及后续导入功能必须满足：

1. 用户先看到来源、用途、版权和非官方说明。
2. 用户显式确认后才下载或导入。
3. 素材存放在本机或自用 VPS，不进入 Git。
4. 缺素材不阻塞开局、夜序、日志、投票或 AI 建议。
5. 来源清单必须记录原始 URL 和 SHA-256；下载器不得绕过校验。

## AI 与密钥

- 公开源码、构建产物、示例配置和 Git 历史不得内置真实 API Key。
- 用户在页面设置里明确保存“兼容接口”配置后，前端会把地址、模型和 API Key 存入当前站点在当前浏览器里的 `localStorage`，供后续配板、夜间建议和复盘请求继续使用。
- 浏览器本地保存不等于上传 GitHub，也不等于服务器持久化；换浏览器、换设备或清除站点数据后不会自动同步或恢复。
- 浏览器保存的 Key 只允许发送给本机或 HTTPS 后端；普通 HTTP 公网后端不得接收这份 Key。
- 后端自己的 Key 只从环境变量或后端密钥文件读取，不从仓库读取。
- `localStorage` 不是安全密钥库；公共电脑、共享浏览器和不可信扩展环境不得建议保存真实 Key。
- `.env.example` 只能写占位符。
- 公开仓库前必须运行 `npm run audit:public`。

## 公开 VPS 运行边界

GitHub 仓库可以公开，不等于后端全部 API 可以匿名公开。隐藏 VPS 地址、只把地址私下发给熟人或依赖 CORS，都不是可靠的访问控制。

默认本机/自用模式保持兼容；只有显式设置 `BOTC_PUBLIC_ACCESS_MODE=true` 才进入公开分享模式。该模式的匿名边界是：

- 允许静态页面、PWA 资源和 `/healthz`。
- 禁止 `/api/archives*`、`/api/recovery/*` 和任何使用 VPS 自有 Key 的 AI 请求。
- 普通用户继续使用各自浏览器里的本机对局、本机归档、离线功能和 JSON 导出恢复；公开模式不应把这些核心能力绑到 VPS 私有 API。
- `BOTC_PUBLIC_AI_ALLOWED_HOSTS` 留空时，不开放匿名真实 AI 代理。
- 如启用 BYOK，只接受白名单内的 HTTPS provider 主机；用户必须提交完整地址、模型和自己的 Key，不能与 VPS 配置逐字段混用。
- BYOK 代理的服务端限制为：AI 请求体最多 1 MiB、同一 runtime 可见来源地址每分钟最多 10 次 AI 请求；其他 `/api/` 请求体最多 5 MiB、每分钟最多 30 次。前端节流、CORS 和隐藏按钮不能替代服务端限制。

公开配置示例只能使用占位域名：

```powershell
$env:BOTC_PUBLIC_ACCESS_MODE='true'
$env:BOTC_PUBLIC_AI_ALLOWED_HOSTS='api.example.com'
```

不得在仓库、Issue、Release、截图或示例命令中写入真实 VPS 地址、服务器 Key、用户 Key 或反向代理凭证。

上述边界已通过源码测试、生产后端构建和本机 HTTP smoke。它不代表目标 VPS 已部署或经过公网实机验收；发布前仍要检查 HTTPS、反向代理、防火墙和 429 行为。当前限流不信任转发头，反向代理后的用户可能共享同一限额。

## 发布措辞

允许：

> 社区制作的非官方说书人辅助工具。

> AI 只生成草稿和建议，权威状态由说书人确认。

> 已通过模拟主持流程验证，适合自用和早期试用。

禁止：

> 官方工具。

> 官方魔典替代品。

> 已通过真实线下局验证。

> 自动正确结算所有规则。

## 公开前检查

```powershell
npm run audit:public
npm run check
```

人工复核：

- README 是否明确非官方。
- THIRD_PARTY_NOTICES 是否列出来源。
- 素材二进制是否未进入 Git。
- `.env.example` 是否没有真实 Key。
- 发布文案是否是 alpha / preview，而不是正式稳定版。

## 参考来源

- TPI Community Created Content Policy: https://bloodontheclocktower.com/pages/community-created-content-policy
- TPI Creativity, Copyright, & Design Terms: https://bloodontheclocktower.com/pages/creativity-copyright-design-terms-version-1-1
- 项目第三方说明：`THIRD_PARTY_NOTICES.md`
