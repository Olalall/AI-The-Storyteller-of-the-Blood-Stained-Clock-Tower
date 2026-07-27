# 剧本集合来源锁定：Antiphoton / Tachyon BOTC Collection

日期：2026-07-21  
本文件只锁定来源与导入边界，不代表已经把集合内所有剧本接入项目。

## 1. 用户提供的来源

### 来源 A：Antiphoton 中文集合

- URL: https://antiphoton.github.io/botc/zh-cn/collection
- 浏览器实测显示：`剧本 × 1080`
- 首屏来源组：`官方基础包`
- 首屏示例：`暗流涌动`、`梦陨春宵`、`黯月初升`、`虚伪假面`、`嗤之以鼻`、`虔诚信仰`、`仇海溺行`、`癫狂直觉`
- 用途：优先作为“较干净的中文集合入口”。

### 来源 B：Tachyon / botcscripts 汇总集合

- URL: https://antiphoton.github.io/botc/zh-cn/collection#book=https%3A%2F%2Ftachyondungeon.xyz%2Fs%2Fbotc%2F0
- 实际加载数据：`https://tachyondungeon.xyz/s/botc/0`
- 浏览器实测显示：`剧本 × 15402`
- 首屏来源组：`From botcscripts.com`
- 首屏示例：`Hosting Evil`、`Where art thou, fair maiden?`
- 用途：作为大规模社区剧本搜索池，不作为默认全量导入对象。

## 2. 页面实际数据形态

浏览器请求实测发现页面会加载：

- `https://antiphoton.github.io/collection-of-botc/rule.capnp`
- `https://antiphoton.github.io/scripts-of-botc/book.capnp`
- `https://antiphoton.github.io/scripts-of-botc/lei.capnp`
- `https://tachyondungeon.xyz/s/botc/0`

页面上的剧本链接形态为：

```text
https://antiphoton.github.io/botc/zh-cn/script#data=<encoded-script>
```

这说明后续有两条读取路线：

1. 解析 collection 的 `book.capnp` / `tachyondungeon` 二进制集合，直接得到完整列表。
2. 使用浏览器运行时 / 虚拟列表采集可见脚本链接，再逐个打开 `script#data=` 解析。

正式导入前优先做第 1 条。第 2 条只能作为抽样 / 兜底，因为虚拟列表滚动采集可能漏项。

## 3. 已验证事实

- Antiphoton 默认集合页面不是静态 HTML；它是前端应用，脚本列表由运行时加载。
- 默认中文集合浏览器显示 1080 个剧本。
- Tachyon 汇总集合浏览器显示 15402 个剧本。
- 页面使用 `capnp` / 二进制数据，不是直接暴露普通 JSON。
- 页面虚拟列表可采集部分 `script#data=` 链接，但滚动采集不是正式导入依据。

## 4. 导入边界

允许：

- 作为来源索引。
- 记录来源 URL、来源集合、hash、版本、作者。
- 解析出剧本角色列表、夜序、setup 修正、特殊规则提醒。
- 转成 `SmartScriptPack` 后由说书人确认使用。

禁止：

- 不筛选地把 1080 或 15402 个剧本一次性塞进 registry。
- 把社区剧本标成官方剧本。
- 把来源中的规则文本当作已确认的自动结算逻辑。
- 在页面组件里针对单个剧本写特殊 `if`。
- 因为来源可读取就绕过 `ROLE_CENSUS.md` / `SCRIPT_RULE_CENSUS.md`。

## 5. 下一步建议

已建立“集合读取器原型”：

```powershell
node scripts/scout-script-collection.mjs --limit=20
node scripts/scout-script-collection.mjs --url="https://antiphoton.github.io/botc/zh-cn/collection#book=https%3A%2F%2Ftachyondungeon.xyz%2Fs%2Fbotc%2F0" --limit=20
```

当前原型目标只到可观察输出：

```text
输入：collection URL 或 book URL
输出：前 20 个剧本的 sourceId、title、version、encoded script link、角色 ID/名称摘要
不写入 src/domain/scripts/packs
不注册 catalog
不改 UI
```

注意：当前读取器使用浏览器运行时读取页面和虚拟列表，只适合作为侦察/抽样工具。正式大批量导入前仍建议补二进制集合解析器，避免虚拟列表漏项。

读取器通过后，下一步创建 `batch-03`：

```text
dev-docs/script-import-work/batch-03/
  SOURCE_LOCK.md
  ROLE_CENSUS.md
  SCRIPT_RULE_CENSUS.md
```

之后才开始逐个转 `SmartScriptPack`。
