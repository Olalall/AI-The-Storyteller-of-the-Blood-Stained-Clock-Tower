import ts from 'typescript'

/** Only primitive data values are pooled; object identity and script data stay intact. */
export function scriptTextValues(code: string) {
  const source = ts.createSourceFile('pack.ts', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const values: { text: string; start: number; end: number }[] = []
  function visit(node: ts.Node) {
    if (ts.isStringLiteral(node) && node.text.length >= 24 && (
      (ts.isPropertyAssignment(node.parent) && node.parent.initializer === node) ||
      ts.isArrayLiteralExpression(node.parent)
    )) values.push({ text: node.text, start: node.getStart(source), end: node.end })
    ts.forEachChild(node, visit)
  }
  visit(source)
  return values
}

export function createScriptTextPool(sources: readonly string[]) {
  const counts = new Map<string, number>()
  for (const code of sources) for (const value of scriptTextValues(code)) {
    counts.set(value.text, (counts.get(value.text) ?? 0) + 1)
  }
  return new Map([...counts].filter(([, count]) => count >= 3).map(([text], index) => [text, `s${index}`]))
}

export const scriptTextModule = 'virtual:botc-script-text'

export function compactScriptText(code: string, pool: ReadonlyMap<string, string>) {
  const replacements = scriptTextValues(code).filter((value) => pool.has(value.text))
  if (!replacements.length) return null
  let binding = '__botcPackText'
  while (code.includes(binding)) binding += '_'
  for (const value of replacements.reverse()) {
    code = code.slice(0, value.start) + `${binding}.${pool.get(value.text)}` + code.slice(value.end)
  }
  return `import * as ${binding} from '${scriptTextModule}';\n${code}`
}

export function renderScriptTextPool(pool: ReadonlyMap<string, string>) {
  return [...pool].map(([text, name]) => `export const ${name}=${JSON.stringify(text)};`).join('\n')
}
