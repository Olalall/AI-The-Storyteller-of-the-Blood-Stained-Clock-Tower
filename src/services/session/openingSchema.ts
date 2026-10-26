const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const text = (v: unknown, max: number) => typeof v === 'string' && v.length <= max
const seat = (v: unknown) => Number.isInteger(v) && Number(v) >= 1 && Number(v) <= 15

export function validOpeningChoices(value: unknown): boolean {
  return Array.isArray(value) && value.length <= 15 && value.every(c => object(c) && seat(c.seatId) && text(c.roleId, 120)
    && (c.targetSeatId === undefined || seat(c.targetSeatId)) && (c.chosenRoleId === undefined || text(c.chosenRoleId, 120))
    && (c.sourceRoleId === undefined || text(c.sourceRoleId, 120))
    && (c.text === undefined || text(c.text, 400))
    && (c.minionSeatIds === undefined || Array.isArray(c.minionSeatIds) && c.minionSeatIds.length <= 5 && c.minionSeatIds.every(seat))
    && (c.bluffRoleIds === undefined || Array.isArray(c.bluffRoleIds) && c.bluffRoleIds.length <= 3 && c.bluffRoleIds.every(v => text(v, 120))))
}

export function validOpeningPreparations(value: unknown): boolean {
  return value === undefined || Array.isArray(value) && value.length <= 30 && value.every(p => object(p)
    && text(p.id, 180) && text(p.setupId, 180) && text(p.assignmentKey, 2200) && text(p.confirmedAt, 40)
    && Number.isFinite(Date.parse(String(p.confirmedAt))) && validOpeningChoices(p.choices))
}
