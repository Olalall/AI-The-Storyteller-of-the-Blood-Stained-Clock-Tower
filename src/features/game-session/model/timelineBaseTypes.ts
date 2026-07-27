export interface TimelineBase {
  id: string
  /**
   * 配板确认和开局后的微调也要留在审计链中，但它们不能因为被记录而
   * 偷偷创建昼夜段。因此它们的 `segmentId` 为 null。
   */
  segmentId: string | null
  createdAt: string
  confirmedBy: 'storyteller'
  correctionOf?: string
  /**
   * 新建的历史更正必须说明原因；早期本地原型记录可能没有这个字段，
   * 因此读取时允许为空，但不会把它当作说书人已填写原因。
   */
  correctionReason?: string
}
