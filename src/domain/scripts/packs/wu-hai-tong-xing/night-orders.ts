import type { NightOrderEntry } from '../../types'

const officialNightSheetUrl = 'https://oss.gstonegames.com/data_file/clocktower/upload/1689611944_197011_8300.png'

function order(entries: readonly { roleId: string; sourceOrder: number }[]): readonly NightOrderEntry[] {
  return entries.map((entry, index) => ({
    roleId: entry.roleId,
    order: index + 1,
    note: `Official night-sheet source order: ${entry.sourceOrder} (${officialNightSheetUrl})`,
    knowledgeStatus: 'confirmed',
  }))
}

export const wuHaiTongXingFirstNightOrder = order([
  {
    "roleId": "20774_8379",
    "sourceOrder": 11
  },
  {
    "roleId": "20774_8384",
    "sourceOrder": 12
  },
  {
    "roleId": "20774_8385",
    "sourceOrder": 13
  },
  {
    "roleId": "20774_8382",
    "sourceOrder": 14
  },
  {
    "roleId": "20774_8386",
    "sourceOrder": 15
  },
  {
    "roleId": "20774_8365",
    "sourceOrder": 16
  },
  {
    "roleId": "20774_8366",
    "sourceOrder": 17
  },
  {
    "roleId": "20774_8367",
    "sourceOrder": 18
  },
  {
    "roleId": "20774_8368",
    "sourceOrder": 19
  }
])
export const wuHaiTongXingOtherNightOrder = order([
  {
    "roleId": "20774_8399",
    "sourceOrder": 2
  },
  {
    "roleId": "20774_8398",
    "sourceOrder": 3
  },
  {
    "roleId": "20774_8400",
    "sourceOrder": 4
  },
  {
    "roleId": "20774_8381",
    "sourceOrder": 5
  },
  {
    "roleId": "20774_8380",
    "sourceOrder": 6
  },
  {
    "roleId": "20774_8384",
    "sourceOrder": 7
  },
  {
    "roleId": "20774_8383",
    "sourceOrder": 8
  },
  {
    "roleId": "20774_8385",
    "sourceOrder": 9
  },
  {
    "roleId": "20774_8386",
    "sourceOrder": 10
  },
  {
    "roleId": "20774_8387",
    "sourceOrder": 11
  },
  {
    "roleId": "20774_8388",
    "sourceOrder": 12
  },
  {
    "roleId": "20774_8389",
    "sourceOrder": 13
  },
  {
    "roleId": "20774_8379",
    "sourceOrder": 14
  },
  {
    "roleId": "20774_8375",
    "sourceOrder": 15
  },
  {
    "roleId": "20774_8370",
    "sourceOrder": 16
  },
  {
    "roleId": "20774_8372",
    "sourceOrder": 17
  },
  {
    "roleId": "20774_8374",
    "sourceOrder": 18
  },
  {
    "roleId": "20774_8366",
    "sourceOrder": 19
  },
  {
    "roleId": "20774_8368",
    "sourceOrder": 20
  },
  {
    "roleId": "20774_8369",
    "sourceOrder": 21
  },
  {
    "roleId": "20774_8371",
    "sourceOrder": 22
  },
  {
    "roleId": "20774_8373",
    "sourceOrder": 23
  },
  {
    "roleId": "20774_8377",
    "sourceOrder": 24
  }
])
