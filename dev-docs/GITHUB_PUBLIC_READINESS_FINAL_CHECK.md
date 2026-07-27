# GitHub Public Readiness Final Check

Date: 2026-07-27
Repository: `Olalall/botc-storyteller-companion`
URL: https://github.com/Olalall/botc-storyteller-companion
Current visibility: Public
Default branch: `main`
License: MIT License, original source code and original project documentation only

## Verdict

Public switch completed after owner confirmation. The repository is public as an alpha / preview repository.

Do not market it as a stable official product. Recommended public label:

> alpha / preview — unofficial storyteller companion for in-person Blood on the Clocktower games.

## Final checks performed

```powershell
npm run audit:public
npm run check
gh repo view Olalall/botc-storyteller-companion --json nameWithOwner,description,visibility,url,defaultBranchRef,licenseInfo,repositoryTopics
```

Results:

- `npm run audit:public`: passed.
- `npm run check`: passed.
- Test result: 178 test files passed, 1 skipped; 840 tests passed, 3 live AI tests skipped.
- Build: passed.
- Architecture verification: passed.
- GitHub license detection: `mit` / MIT License.
- GitHub visibility after owner-confirmed switch: Public.
- Working tree: clean before this readiness document was written.

Known non-blocking warning:

- Vite still reports one large client chunk after minification. This is a performance/packaging improvement item, not a public-release blocker for alpha / preview.

## Public repository boundaries

Confirmed in README / notices:

- Non-official community project.
- Not affiliated with, endorsed by, sponsored by, or approved by The Pandemonium Institute.
- Not an official grimoire replacement.
- Not an automatic rules engine.
- AI suggestions remain drafts; the storyteller is final authority.
- MIT License applies only to original source code and original project documentation.
- MIT License does not grant rights to Blood on the Clocktower, official/community scripts, role names, rules text, visual assets, trademarks, provider-owned materials, or any third-party content.
- Official/community binary assets remain excluded from the public repository by default.

## GitHub homepage readiness

README currently includes:

- Original hero banner.
- Project state: `alpha / preview`.
- What problem it solves.
- Feature matrix.
- 12 screenshot walkthrough.
- One-game usage flow.
- Core capabilities.
- AI authority boundary.
- Quick start.
- Backend and AI configuration.
- Public repository / asset pack boundary.
- Third-party notices and license note.

## After public switch

Public visibility has been enabled after explicit owner confirmation.

Optional next steps:

- Create first GitHub Release: `alpha-preview-20260727`.
- GitHub Issues / Discussions 已开启；反馈路线图 issue 已创建并置顶：#1 https://github.com/Olalall/botc-storyteller-companion/issues/1
- Add an English one-paragraph summary later if desired.

## Not done intentionally

- Repository was switched to Public only after explicit owner confirmation.
- Did not upload or redistribute official/community binary art assets.
- Did not run live AI smoke, because it requires real model credentials and may consume API quota.

## Public feedback intake

- Issues: enabled.
- Discussions: enabled.
- Pinned roadmap / known limitations issue: https://github.com/Olalall/botc-storyteller-companion/issues/1
- Purpose: collect alpha feedback without changing the product boundary. AI remains draft-only and the repository remains an unofficial companion tool.
