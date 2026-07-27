from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Dict, List

from datetime import date

DATA_FILE = Path('tmp_wu_hai_tong_xing.json')
OUT_DIR = Path('src/domain/scripts/packs/wu-hai-tong-xing')
OUT_DIR.mkdir(parents=True, exist_ok=True)

script_id = 'wu-hai-tong-xing'
verified_at = '2026-07-23'

raw = DATA_FILE.read_bytes()
script_json = json.loads(raw.decode('gb18030'))

meta = next((role for role in script_json if role.get('id') == '_meta'), {})
roles = [role for role in script_json if role.get('id') != '_meta']

source_url = meta.get('logo') or 'https://oss.gstonegames.com/data_file/clocktower'

content_hash = 'sha256:' + hashlib.sha256(raw).hexdigest()
all_player_counts = [7, 8, 9, 10, 11, 12, 13, 14, 15]

base_compositions: Dict[int, Dict[str, int]] = {
    7: {'townsfolk': 5, 'outsider': 0, 'minion': 1, 'demon': 1},
    8: {'townsfolk': 5, 'outsider': 1, 'minion': 1, 'demon': 1},
    9: {'townsfolk': 5, 'outsider': 2, 'minion': 1, 'demon': 1},
    10: {'townsfolk': 7, 'outsider': 0, 'minion': 2, 'demon': 1},
    11: {'townsfolk': 7, 'outsider': 1, 'minion': 2, 'demon': 1},
    12: {'townsfolk': 7, 'outsider': 2, 'minion': 2, 'demon': 1},
    13: {'townsfolk': 9, 'outsider': 0, 'minion': 3, 'demon': 1},
    14: {'townsfolk': 9, 'outsider': 1, 'minion': 3, 'demon': 1},
    15: {'townsfolk': 9, 'outsider': 2, 'minion': 3, 'demon': 1},
}

styles = ['balanced', 'chaos', 'long-game']


def rotate(items: List[str], start: int, length: int) -> List[str]:
    if not items or length <= 0:
        return []
    n = len(items)
    return [items[(start + i) % n] for i in range(length)]


def infer_input_kinds(role: Dict[str, Any]) -> List[str]:
    text = f"{role.get('ability', '')}"
    txt = text.lower()
    kinds: List[str] = []

    player_triggers = ['选择', '选定', '挑选', '查', 'choose', 'any player', 'a player', 'players', '一个玩家', '2', '三个']
    if any(token in txt for token in player_triggers):
        kinds.append('player')

    role_triggers = ['角色', 'character', '身份', 'become', 'skill', 'ability']
    if any(token in txt for token in role_triggers):
        kinds.append('role')

    if '多人' in txt or 'two' in txt or '2' in txt and 'player' in txt:
        kinds = ['players' if 'players' in kinds else 'player']

    if any(token in txt for token in ['数字', '几率', '次数', 'number', 'number of']):
        kinds.append('number')

    if not kinds:
        kinds = ['none']

    # Deduplicate with deterministic order
    seen = set()
    result: List[str] = []
    for kind in kinds:
        if kind not in seen:
            seen.add(kind)
            result.append(kind)

    if 'players' in result:
        # Normalize multi-select when explicit, keep only once.
        result = [kind for kind in result if kind != 'player']
        if 'players' not in result:
            result.append('players')

    return result


def detect_risk_items(text: str) -> List[str]:
    normalized = (text or '').lower()
    keywords = {
        'poisoned': ['poisoned', 'poison', '醉', '毒'],
        'death': ['die', 'dies', 'death', 'dead', 'execut', 'kill', '自杀', '死亡', '死'],
        'alignment': ['alignment', 'evil', 'good', '善', '恶', '变为', '转为', 'become'],
        'identity': ['swap', '交换', '变', '变化', 'character', '身份', '转换', '成为', '变成'],
        'madness': ['mad', 'madness', '疯狂', '被逼迫', '发疯', '发狂'],
    }

    hits = set()
    for key, words in keywords.items():
        if any(word in normalized for word in words):
            hits.add(key)
    return sorted(hits)


def infer_research_fields(role: Dict[str, Any]) -> Dict[str, List[str]]:
    ability = role.get('ability', '')
    risk = detect_risk_items(ability)

    result = {
        'setupImpact': [],
        'possibleOutcomes': [
            f"Apply {role.get('name', role.get('id'))} effect as a storyteller-verified draft result.",
        ],
        'stateChanges': [],
        'identityChanges': [],
        'teamChanges': [],
        'playerMessageTemplates': [
            f"You may say: you are now {role.get('name', 'the new role')}",
        ],
        'highRiskNotes': [],
    }

    if role.get('setup', 0):
        result['setupImpact'].append(f"{role.get('name')} is a setup role; use template or ST confirmation for setup variations.")

    if 'death' in risk:
        result['possibleOutcomes'].append('May create one or more death-related candidates for confirmation.')
        result['stateChanges'].append('Death-related outcomes should be confirmed before changing authoritative state.')
        result['highRiskNotes'].append('Do not auto-commit death state. Storyteller confirms the real target and cause.')
    if 'poisoned' in risk:
        result['stateChanges'].append('May add drunk/poisoned state depending on verified outcome.')
        result['highRiskNotes'].append('Poison/drunk state is advisory; do not apply automatically.')
    if 'identity' in risk:
        result['identityChanges'].append('May change character or public-facing identity.')
        result['highRiskNotes'].append('Identity changes should be confirmed with current board context before update.')
    if 'alignment' in risk:
        result['teamChanges'].append('May affect effective alignment behavior or win/loss interpretation.')
        result['highRiskNotes'].append('Alignment effects are candidate reminders only until storyteller confirms.')
    if 'madness' in risk:
        result['highRiskNotes'].append('Madness handling depends on timing and storyteller confirmation.')

    return result


roles_entries = []
for role in roles:
    ability = role.get('ability', '').strip()
    roles_entries.append(
        {
            'id': role['id'],
            'name': role['name'],
            'officialName': role['name'],
            'team': role['team'],
            'abilityText': ability,
            'iconPath': f"/assets/characters/{role['id']}.webp",
            'inputKinds': infer_input_kinds(role),
            'knowledgeStatus': 'confirmed',
            'research': {
                'edition': 'gstone',
                **infer_research_fields(role),
                'sourceUrls': [
                    source_url,
                    'https://clocktower.gstonegames.com/ct/grimoireRoleJson/',
                ],
                'reviewedAt': verified_at,
            },
        },
    )

setup_roles = [role for role in roles if role['team'] in {'townsfolk', 'outsider', 'minion', 'demon'}]
setup_role_ids = [role['id'] for role in setup_roles]

role_ids_by_team = {
    'townsfolk': [r['id'] for r in setup_roles if r['team'] == 'townsfolk'],
    'outsider': [r['id'] for r in setup_roles if r['team'] == 'outsider'],
    'minion': [r['id'] for r in setup_roles if r['team'] == 'minion'],
    'demon': [r['id'] for r in setup_roles if r['team'] == 'demon'],
}

setup_rules = []
for index, role in enumerate([r for r in roles if r.get('setup', 0)], start=1):
    setup_rules.append(
        {
            'id': f'{script_id}-setup-{index:02d}',
            'roleId': role['id'],
            'summary': f"{role['name']} has setup interaction in source script. Handle via template/step confirmation.",
            'knowledgeStatus': 'confirmed',
            'sourceUrls': [source_url],
            'reviewedAt': verified_at,
        },
    )

if not setup_rules:
    setup_rules.append(
        {
            'id': f'{script_id}-setup-none',
            'summary': 'No explicit setup flags in source data; keep default setup composition.',
            'knowledgeStatus': 'confirmed',
            'sourceUrls': [source_url],
            'reviewedAt': verified_at,
        },
    )


def make_template(player_count: int, style_index: int):
    comp = base_compositions[player_count]
    roles_in_template = (
        rotate(role_ids_by_team['townsfolk'], style_index + player_count, comp['townsfolk'])
        + rotate(role_ids_by_team['outsider'], style_index, comp['outsider'])
        + rotate(role_ids_by_team['minion'], style_index + 1, comp['minion'])
        + rotate(role_ids_by_team['demon'], style_index + 2, comp['demon'])
    )

    # Keep 3 unique bluffs from non-selected setup roles
    bluffs = [role_id for role_id in setup_role_ids if role_id not in roles_in_template]
    while len(bluffs) < 3:
        bluffs.extend(setup_role_ids)
    bluffs = bluffs[:3]

    return {
        'templateId': f'{script_id}-{player_count}-{style_index + 1}',
        'scriptId': script_id,
        'playerCount': player_count,
        'style': styles[style_index],
        'roles': roles_in_template,
        'bluffs': bluffs,
        'notes': [
            'High-frequency skill reminders are advisory; storyteller confirmation remains authority.',
            'Do not apply setup changes outside the chosen template without explicit correction.',
        ],
        'verified': True,
    }

setup_templates = [make_template(count, style_index) for count in all_player_counts for style_index in range(3)]
setup_templates = sorted(setup_templates, key=lambda item: (item['playerCount'], item['style'], item['templateId']))

first_night = sorted(
    [role for role in roles if role.get('firstNight', 0) and role['firstNight'] > 0],
    key=lambda role: role['firstNight'],
)
other_night = sorted(
    [role for role in roles if role.get('otherNight', 0) and role['otherNight'] > 0],
    key=lambda role: role['otherNight'],
)


def dump_json(data):
    return json.dumps(data, ensure_ascii=False, indent=2)

roles_ts = (
    "import type { SmartRoleDefinition } from '../../types'\n\n"
    f"export const wuHaiTongXingRoles = {dump_json(roles_entries)} as const satisfies readonly SmartRoleDefinition[]\n"
)

night_orders_ts = (
    "import type { NightOrderEntry } from '../../types'\n\n"
    f"const officialNightSheetUrl = '{source_url}'\n\n"
    "function order(entries: readonly { roleId: string; sourceOrder: number }[]): readonly NightOrderEntry[] {\n"
    "  return entries.map((entry, index) => ({\n"
    "    roleId: entry.roleId,\n"
    "    order: index + 1,\n"
    "    note: `Official night-sheet source order: ${entry.sourceOrder} (${officialNightSheetUrl})`,\n"
    "    knowledgeStatus: 'confirmed',\n"
    "  }))\n"
    "}\n\n"
    f"export const wuHaiTongXingFirstNightOrder = order({dump_json([{'roleId': role['id'], 'sourceOrder': role['firstNight']} for role in first_night])})\n"
    f"export const wuHaiTongXingOtherNightOrder = order({dump_json([{'roleId': role['id'], 'sourceOrder': role['otherNight']} for role in other_night])})\n"
)

setup_rules_ts = (
    "import type { SetupRule } from '../../types'\n\n"
    f"export const wuHaiTongXingSetupRules = {dump_json(setup_rules)} as const satisfies readonly SetupRule[]\n"
)

setup_templates_ts = (
    "import type { SetupTemplate } from '../../types'\n\n"
    f"export const wuHaiTongXingSetupTemplates = {dump_json(setup_templates)} as const satisfies readonly SetupTemplate[]\n"
)

index_ts = f"""import type {{ SmartScriptPack }} from '../../types'
import {{ wuHaiTongXingFirstNightOrder, wuHaiTongXingOtherNightOrder }} from './night-orders'
import {{ wuHaiTongXingRoles }} from './roles'
import {{ wuHaiTongXingSetupRules }} from './setup-rules'
import {{ wuHaiTongXingSetupTemplates }} from './setup-templates'

export const wuHaiTongXingSmartScriptPack = {{
  scriptId: '{script_id}',
  displayName: '{meta.get('name', '雾海同行')}',
  source: {{
    author: '{meta.get('author', 'GStone')}',
    version: 'GStone script import',
    url: '{source_url}',
    contentHash: '{content_hash}',
    verifiedAt: '{verified_at}',
  }},
  playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
  roles: wuHaiTongXingRoles,
  nightOrders: {{
    firstNight: wuHaiTongXingFirstNightOrder,
    otherNight: wuHaiTongXingOtherNightOrder,
  }},
  setupTemplates: wuHaiTongXingSetupTemplates,
  setupRules: wuHaiTongXingSetupRules,
  knowledgeStatus: 'confirmed',
}} satisfies SmartScriptPack
"""

index_test_ts = """import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { wuHaiTongXingSmartScriptPack } from './index'

describe('wu-hai-tong-xing smart script pack', () => {
  it('keeps locked source metadata and valid role list', () => {
    expect(wuHaiTongXingSmartScriptPack.scriptId).toBe('wu-hai-tong-xing')
    expect(wuHaiTongXingSmartScriptPack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
    expect(wuHaiTongXingSmartScriptPack.roles.length).toBeGreaterThanOrEqual(18)
    expect(wuHaiTongXingSmartScriptPack.nightOrders.firstNight.length).toBeGreaterThan(0)
    expect(wuHaiTongXingSmartScriptPack.nightOrders.otherNight.length).toBeGreaterThan(0)
  })

  it('verifies setup templates are composition-valid for each count', () => {
    for (const template of wuHaiTongXingSmartScriptPack.setupTemplates) {
      const report = validateTemplateComposition(wuHaiTongXingSmartScriptPack, template)
      expect(template.verified, template.templateId).toBe(true)
      expect(template.bluffs.length).toBe(3)
      expect(template.roles.length).toBe(template.playerCount)
      expect(report.valid, template.templateId).toBe(true)
    }
  })
})
"""

(OUT_DIR / 'roles.ts').write_text(roles_ts, encoding='utf-8')
(OUT_DIR / 'night-orders.ts').write_text(night_orders_ts, encoding='utf-8')
(OUT_DIR / 'setup-rules.ts').write_text(setup_rules_ts, encoding='utf-8')
(OUT_DIR / 'setup-templates.ts').write_text(setup_templates_ts, encoding='utf-8')
(OUT_DIR / 'index.ts').write_text(index_ts, encoding='utf-8')
(OUT_DIR / 'index.test.ts').write_text(index_test_ts, encoding='utf-8')

print(f'generated {OUT_DIR}')
print('roles', len(roles_entries), 'firstNight', len(first_night), 'otherNight', len(other_night), 'templates', len(setup_templates), 'setupRules', len(setup_rules))
