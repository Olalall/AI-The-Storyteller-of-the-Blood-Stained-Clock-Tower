# alpha-preview-20260727

Release type: GitHub alpha / preview
Date: 2026-07-27
Repository: https://github.com/Olalall/botc-storyteller-companion
GitHub Release URL: https://github.com/Olalall/botc-storyteller-companion/releases/tag/alpha-preview-20260727
GitHub Release status: prerelease, published

## Summary

钟楼说书人副驾驶 is an unofficial, Pad-first storyteller companion for in-person Blood on the Clocktower games.

It is designed to sit beside the official/physical grimoire and help the storyteller with:

- smart setup drafts;
- night order assistance;
- ability settlement suggestions;
- day nomination and voting records;
- structured journal and corrections;
- game archive and AI review drafts.

AI suggestions are always drafts. The storyteller remains the final authority.

## 中文摘要

这是《血染钟楼》线下说书人的非官方辅助工具，定位是：记录台 + 夜序辅助 + AI 草稿顾问 + 复盘索引。

它适合：

- 线下自用；
- Pad 分屏主持；
- 自用 VPS 部署；
- 早期 GitHub 预览和反馈。

它不适合宣传为：

- 官方工具；
- 官方魔典替代品；
- 自动规则引擎；
- 自动执行技能；
- 自动判定胜负；
- 已通过真实线下局验证。

## Highlights

### 1. GitHub-ready project homepage

- Added original GitHub hero banner.
- Added 12 screenshot walkthroughs:
  - dashboard;
  - smart script library;
  - AI setup advice;
  - identity handoff;
  - night workbench;
  - day vote;
  - public timer;
  - AI settings;
  - opening display;
  - player detail;
  - journal;
  - archive review.
- Added feature matrix and one-game usage flow.
- Added clear AI authority boundary.

### 2. Smart setup and script packs

- Supports 7-15 player setup flow.
- Smart script packs separate role pool, night order, setup reminders, templates and AI helper knowledge.
- Setup candidates remain storyteller-confirmed drafts.
- Script quality panel identifies imported, playable, needs-review and deferred script states.

### 3. Night order assistant

- Filters night order by current in-play roles.
- Wakes roles one by one.
- Records target choices, guessed roles, outcome drafts and AI suggestions.
- Complex roles remain draft-only; no automatic identity, alignment, death, poison/drunk or madness state changes.

### 4. Day voting and timer

- Supports nomination flow, vote hand records, dead votes, execution threshold, standing execution and tie handling.
- Vote recording does not kill players automatically.
- Focused public discussion timer supports private discussion first, then public discussion.

### 5. Journal, archive and review

- Structured timeline grouped by day/night.
- Corrections append new records instead of overwriting old entries.
- End-game flow saves archive before reset.
- Review page shows timeline summary, player comments and AI review draft.

### 6. AI and backend boundary

- Real AI integration is backend-proxied and optional.
- Frontend does not save API keys.
- AI unavailable mode still supports setup, night order, voting, journal, timer and archive.
- Optional live AI smoke exists but is not part of default checks.

### 7. Public repository and license boundary

- Repository is public.
- Original source code and original project documentation use MIT License.
- MIT License does not grant rights to Blood on the Clocktower, official/community scripts, role names, rules text, visual assets, trademarks, provider-owned materials, or third-party content.
- Official/community binary assets are excluded by default and remain optional local packs.

## Validation

Last recorded public readiness validation:

```powershell
npm run audit:public
npm run check
```

Result:

- public audit: passed;
- 178 test files passed, 1 skipped;
- 840 tests passed, 3 live AI tests skipped;
- build passed;
- architecture verification passed;
- GitHub licenseInfo detected as MIT.

Known non-blocking warning:

- Vite reports one large client chunk after minification. This is a performance follow-up, not an alpha preview blocker.

## Not included in this alpha preview

- Official grimoire synchronization.
- Player inbox / persistent player client.
- Automatic full rules engine.
- Automatic skill execution.
- Automatic win/loss judgement.
- Bundled official/community visual asset packs.
- Guarantee of real-game field validation.

## Suggested GitHub release title

```text
alpha-preview-20260727
```

## Suggested release description

```markdown
First public alpha / preview of 钟楼说书人副驾驶 — an unofficial Pad-first storyteller companion for in-person Blood on the Clocktower games.

Focus areas:
- smart setup drafts;
- current-game night order assistance;
- day voting records;
- structured journal and corrections;
- archive review and AI review drafts.

AI suggestions are drafts only. The storyteller remains final authority.

This repository does not license Blood on the Clocktower content, official/community scripts, role names, rules text, visual assets, trademarks, provider-owned materials, or third-party content. See THIRD_PARTY_NOTICES.md.
```

## Next after release

Recommended follow-ups:

1. Open Issues for feedback.
2. Add short English README summary if needed.
3. Add deployment notes for self-hosting.
4. Plan code splitting for the large Vite chunk warning.
5. Continue smart script quality review and AI night suggestion regression.
