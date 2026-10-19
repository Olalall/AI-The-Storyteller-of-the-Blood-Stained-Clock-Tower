/** Local record identifier, not an authentication token. getRandomValues also works on LAN HTTP pages. */
export function createFollowupId() {
  const words = globalThis.crypto.getRandomValues(new Uint32Array(4))
  return `followup-${Array.from(words, (word) => word.toString(16).padStart(8, '0')).join('')}`
}
