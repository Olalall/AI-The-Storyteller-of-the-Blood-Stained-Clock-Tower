import type { NightOrderEntry } from '../../types'

const officialNightSheetUrl = 'https://release.botc.app/resources/data/nightsheet.json'

function order(entries: readonly { roleId: string; sourceOrder: number }[]): readonly NightOrderEntry[] {
  return entries.map((entry, index) => ({
    roleId: entry.roleId,
    order: index + 1,
    note: `Official night sheet source order: ${entry.sourceOrder}; source: ${officialNightSheetUrl}`,
    knowledgeStatus: 'confirmed',
  }))
}

export const catfishingFirstNightOrder = order([
  {
    "roleId": "apprentice",
    "sourceOrder": 9
  },
  {
    "roleId": "barista",
    "sourceOrder": 10
  },
  {
    "roleId": "philosopher",
    "sourceOrder": 14
  },
  {
    "roleId": "lunatic",
    "sourceOrder": 22
  },
  {
    "roleId": "widow",
    "sourceOrder": 34
  },
  {
    "roleId": "snakecharmer",
    "sourceOrder": 37
  },
  {
    "roleId": "godfather",
    "sourceOrder": 38
  },
  {
    "roleId": "cerenovus",
    "sourceOrder": 43
  },
  {
    "roleId": "amnesiac",
    "sourceOrder": 51
  },
  {
    "roleId": "investigator",
    "sourceOrder": 54
  },
  {
    "roleId": "chef",
    "sourceOrder": 55
  },
  {
    "roleId": "fortuneteller",
    "sourceOrder": 57
  },
  {
    "roleId": "grandmother",
    "sourceOrder": 59
  },
  {
    "roleId": "dreamer",
    "sourceOrder": 61
  },
  {
    "roleId": "balloonist",
    "sourceOrder": 66
  }
])

export const catfishingOtherNightOrder = order([
  {
    "roleId": "barista",
    "sourceOrder": 6
  },
  {
    "roleId": "harlot",
    "sourceOrder": 9
  },
  {
    "roleId": "bonecollector",
    "sourceOrder": 10
  },
  {
    "roleId": "philosopher",
    "sourceOrder": 11
  },
  {
    "roleId": "gambler",
    "sourceOrder": 21
  },
  {
    "roleId": "snakecharmer",
    "sourceOrder": 23
  },
  {
    "roleId": "cerenovus",
    "sourceOrder": 28
  },
  {
    "roleId": "pithag",
    "sourceOrder": 29
  },
  {
    "roleId": "lunatic",
    "sourceOrder": 35
  },
  {
    "roleId": "imp",
    "sourceOrder": 40
  },
  {
    "roleId": "fanggu",
    "sourceOrder": 45
  },
  {
    "roleId": "vigormortis",
    "sourceOrder": 49
  },
  {
    "roleId": "godfather",
    "sourceOrder": 57
  },
  {
    "roleId": "sweetheart",
    "sourceOrder": 61
  },
  {
    "roleId": "amnesiac",
    "sourceOrder": 69
  },
  {
    "roleId": "grandmother",
    "sourceOrder": 73
  },
  {
    "roleId": "ravenkeeper",
    "sourceOrder": 75
  },
  {
    "roleId": "fortuneteller",
    "sourceOrder": 77
  },
  {
    "roleId": "dreamer",
    "sourceOrder": 79
  },
  {
    "roleId": "balloonist",
    "sourceOrder": 85
  }
])
