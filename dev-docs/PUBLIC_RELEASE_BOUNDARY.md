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

- 前端不保存真实 API Key。
- 后端只从环境变量或后端密钥文件读取 Key。
- `.env.example` 只能写占位符。
- 公开仓库前必须运行 `npm run audit:public`。

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
