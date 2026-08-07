/**
 * 魔典上那几条「提示条」的长期处置。
 *
 * 为什么必须跨会话：完整度提示条上的「不再提示」此前只活在组件 state 里，
 * 刷新一次、切一次视图就全忘了。而这条提示的触发条件（有欠账记录）在一局里
 * 通常一直成立——于是说书人每次回到魔典都要再关一次同一条提示。
 * 「关掉」被反复无效化之后，人学到的不是「再关一次」，而是「这条提示不用看」，
 * 那时它在真正重要的那一局里也不会被读了。
 *
 * 为什么不放 session：它不是对局事实。同一局导出给别人看、或者归档回放时，
 * 「我当时按过不再提示」这件事既不该跟着走，也不该出现在战绩里。
 * 它是这台设备上这个人的偏好，和 hostingPreferences 同一层。
 *
 * 与 hostingPreferences 分文件而不是加两个字段：那份的硬规则是「运行时只准 App 层
 * 在建局时读一次」，并有 verify-architecture 的 hosting-preferences-not-runtime
 * 规则守着。提示偏好恰恰要在渲染时读，塞进同一个模块会让那条守门规则要么误伤、
 * 要么被迫放宽——放宽之后模式偏好就又能被渲染层读到了。
 */

/** 登记于 scripts/verify-architecture.mjs 的 localStorageKeyAllowlist。 */
export const grimoirePromptPreferencesStorageKey = 'botc-copilot-grimoire-prompts-v1'

export interface GrimoirePromptPreferences {
  /** 完整度提示条的「不再提示」。只对提示条本身生效，不影响补录建议卡的可达性。 */
  completenessSilenced: boolean
}

export const defaultGrimoirePromptPreferences: GrimoirePromptPreferences = {
  completenessSilenced: false,
}

/**
 * 缺省一律取「不静音」。
 * 反过来（读不出来就当成静音过）会让一次损坏的存储把提示永久藏起来，
 * 而这条提示的全部价值就在于「说书人自己没意识到魔典是空的」那一刻。
 */
export function normalizeGrimoirePromptPreferences(value: unknown): GrimoirePromptPreferences {
  if (!value || typeof value !== 'object') return defaultGrimoirePromptPreferences
  return {
    completenessSilenced: (value as Partial<GrimoirePromptPreferences>).completenessSilenced === true,
  }
}

export function readGrimoirePromptPreferences(): GrimoirePromptPreferences {
  try {
    const stored = window.localStorage.getItem(grimoirePromptPreferencesStorageKey)
    return stored ? normalizeGrimoirePromptPreferences(JSON.parse(stored)) : defaultGrimoirePromptPreferences
  } catch {
    return defaultGrimoirePromptPreferences
  }
}

export function saveGrimoirePromptPreferences(preferences: GrimoirePromptPreferences) {
  try {
    window.localStorage.setItem(
      grimoirePromptPreferencesStorageKey,
      JSON.stringify(normalizeGrimoirePromptPreferences(preferences)),
    )
  } catch {
    // 偏好写不进去不该影响这一局：本次会话仍按内存里的值走。
  }
}

/** 「不再提示」按下时调一次。单独给一个函数，是为了让调用点读起来就是那句话。 */
export function silenceGrimoireCompletenessPrompt() {
  saveGrimoirePromptPreferences({ completenessSilenced: true })
}
