export function compactBluffHint(reason?: string) {
  if (!reason) return '未在场镇民'
  if (reason.includes('首夜')) return '首夜线'
  if (reason.includes('每天') || reason.includes('持续')) return '长期线'
  if (reason.includes('一次')) return '一次能力'
  if (reason.includes('数字') || reason.includes('座位')) return '座位线'
  if (reason.includes('猜测') || reason.includes('风险')) return '高风险线'
  return '可讲身份'
}
