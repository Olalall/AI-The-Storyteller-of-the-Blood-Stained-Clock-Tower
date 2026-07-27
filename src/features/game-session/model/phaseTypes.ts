export type PhaseKind = 'night' | 'day'

export interface PhaseSegment {
  id: string
  kind: PhaseKind
  sequence: number
  label: string
  createdAt: string
  closedAt?: string
}
