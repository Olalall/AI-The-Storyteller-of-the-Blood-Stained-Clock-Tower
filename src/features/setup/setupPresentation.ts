export function chineseDisplayName(displayName: string) {
  const names = displayName.split('/').map((name) => name.trim()).filter(Boolean)
  return names.find((name) => /[\u3400-\u9fff]/.test(name)) ?? names[0] ?? displayName
}
