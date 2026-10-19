# AI 权限边界

AI 可以：检索规则、指出缺失信息、生成裁定备选、生成可编辑的结果和日记草稿。

AI 不可以：修改身份或状态、标记死亡、执行处决、判定胜负、切换昼夜、推进夜间光标、向玩家发送信息。

夜间“AI推荐”只应用后端或本地返回的草稿建议。真实建议必须绑定：

- `nightRunId`
- `wakeItemId`
- `contextRevision`
- `contextKey`：当前会话确认记录版本；状态、身份或历史追加后，旧建议不能继续采用
- `playerChoiceRevision`
- `knowledgeVersion`

AI建议只会选中同一组结果选项并生成草稿，仍需说书人选择“停留 / 下一位”并点击“确认本项”。

AI来源必须写入草稿和确认快照：`adviceId + contextRevision + contextKey + sourceDraftRevision + knowledgeVersion`。人工覆盖AI结果时保留“已改为说书人选择”的来源链。

异步回包必须交给当前会话状态处理；整份夜序提交另行校验 `baseRevision + baseContextKey`，不能用请求时的旧快照覆盖后续操作。局面变化后，已填入而未确认的 AI 草稿保留原文，但必须由说书人重新选择明确结果后才能确认。
