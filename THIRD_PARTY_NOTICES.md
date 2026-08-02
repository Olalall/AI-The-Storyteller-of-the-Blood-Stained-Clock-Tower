# Third Party Notices

This project is an unofficial community-made storyteller companion for in-person Blood on the Clocktower games.

It is not affiliated with, endorsed by, sponsored by, or approved by The Pandemonium Institute. It is not an official grimoire, not a replacement for the official app, and not an automatic rules engine.

## Blood on the Clocktower

Blood on the Clocktower, its role names, game concepts, scripts, night order references, and related visual identity belong to their respective rights holders.

Before public release, distribution, commercialization, or asset packaging, re-check the current official policies:

- https://bloodontheclocktower.com/pages/community-created-content-policy
- https://bloodontheclocktower.com/pages/creativity-copyright-design-terms-version-1-1
- https://bloodontheclocktower.com/pages/terms-of-use

## Official reference resources

The project references official toolmaker-style data only as read-only source material for a storyteller assistant:

- Role data: https://release.botc.app/resources/data/roles.json
- Night order data: https://release.botc.app/resources/data/nightsheet.json
- Toolmaker resources: https://release.botc.app/resources/

Local snapshots or manifests may exist for reproducibility and hash checking. They are not presented as a new official rules database.

## Community scripts

Some imported scripts are community-created or community-listed scripts. They are kept with source metadata, authorship where known, content hash, and review status.

Examples include:

- Catfishing / 瓦釜雷鸣
  - Type: community script using official roles
  - Author: Emily
  - Version: 11.1.1
  - Source: https://www.botcscripts.com/script/3/11.1.1/download

Community scripts are not automatically treated as official scripts. They may be marked `needs-review` until their role list, night order, setup rules, and AI helper notes are checked.

## Chinese text and rule summaries

Chinese ability text, rule summaries, AI prompts, and storyteller hints in this project are working references for local hosting. They are not official translations and must not be treated as authoritative rules text.

The storyteller remains the final authority.

## Visual assets

Public repository policy:

- Do not commit official or community binary art assets by default.
- Keep source manifests, hashes, attribution notes, and import instructions.
- Optional local asset packs may be imported by the user after source and usage confirmation.
- Missing assets must degrade gracefully and must not block core app flows.

Ignored by default:

- `public/assets/characters/*.webp`
- `public/assets/community/*`

Allowed as source notes:

- `public/assets/characters/source-manifest.json`
- `public/assets/community/README.md`

## AI providers

AI provider names, APIs, and model names belong to their respective providers. This project does not include API keys. Real keys must be configured only in the user's local environment or backend secret store.

## Node.js runtime in the Windows portable package

The Windows portable release includes an unmodified Node.js executable obtained from the official Node.js distribution server. Its official SHA-256 checksum is verified during packaging. The upstream license is included inside the package at `runtime/node/LICENSE`.

- Project: https://nodejs.org/
- Distribution: https://nodejs.org/dist/
- License: https://github.com/nodejs/node/blob/main/LICENSE

## License note

The original source code and original project documentation in this repository are licensed under the MIT License.

The MIT License does not grant any rights to Blood on the Clocktower, official or community scripts, role names, rules text, visual assets, trademarks, provider-owned materials, or any third-party content.

For clarity:

- The code license does not license Blood on the Clocktower itself.
- The code license does not license official or community visual assets.
- The code license does not license official or community scripts as standalone game content.
- Optional local asset packs remain subject to their original sources and rights holders.
- AI provider APIs, model names, trademarks, and provider-owned materials remain subject to their respective providers.
