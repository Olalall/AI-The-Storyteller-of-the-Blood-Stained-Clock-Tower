export interface OpeningChoice {
  seatId: number
  roleId: string
  targetSeatId?: number
  sourceRoleId?: string
  chosenRoleId?: string
  minionSeatIds?: number[]
  bluffRoleIds?: string[]
  text?: string
}

export interface OpeningPreparation {
  id: string
  setupId: string
  assignmentKey: string
  choices: OpeningChoice[]
  confirmedAt: string
}
