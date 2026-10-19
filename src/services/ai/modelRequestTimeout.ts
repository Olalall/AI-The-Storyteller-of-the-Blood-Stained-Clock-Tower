// 归档传输默认 8 秒；模型预算为 90 秒，另留 10 秒给网络和响应处理。
export function modelRequestTimeoutMs(transportTimeoutMs: number) {
  return Math.max(transportTimeoutMs, 100_000)
}
